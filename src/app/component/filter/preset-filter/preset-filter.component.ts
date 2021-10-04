import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/shared/constants';
import { concatAll, filter, mergeAll } from 'rxjs/operators';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertComponent } from './alert/alert.component';
import { AirduinoComponent } from '../../airduino/airduino.component';
import { MessageService, MessageColor } from 'src/app/shared/service/message.service';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { FilterModel } from 'src/app/model/filter-model';
import sub from 'date-fns/sub';
import { from, Subscription } from 'rxjs';
import { SensorComponent } from '../sensor-filter/sensor.component';
import { exit } from 'process';

@Component({
  selector: 'app-preset-filter',
  templateUrl: './preset-filter.component.html',
  styleUrls: ['./preset-filter.component.css']
})
export class PresetFilterComponent extends AirduinoComponent implements OnInit {
  stayOpened = Constants.STAY_OPEN;
  dialogIsOpen = false;
  presetForm: FormGroup = new FormGroup({});
  appliedFilter = null;
  showSaveAsNewFilterBtn = false;
  newFilterName = '';
  subscription;
  filters = []; // api filter data
  unfilteredFormArray = new FormArray([]);
  filteredFormArray = new FormArray([]);
  newFilterNameControl = new FormControl('');
  searchFilter = '';
  filteredList = [];
  filterValueModified = false;
  constructor(public dialog: MatDialog, private messageService: MessageService, private dataStorageService: DataStorageService, private filterModel: FilterModel) {
    super();
  }

  initForm() {
    this.presetForm = new FormGroup({
      nameArray: this.filteredFormArray,
      newFilterName: this.newFilterNameControl
    });
  }
  fetchFilterList(): void {
    this.unfilteredFormArray.clear();
    let s = this.dataStorageService.fetchFilterList().then(l => { // filter list
      this.filters = l;
      this.filters.forEach(f => {
        if (this.appliedFilter && f.id === this.appliedFilter.id) {
          this.setAppliedFilter(f); // updating current filter
          this.setFilterModified(); // updating modified flag = false
        }
        this.unfilteredFormArray.push(new FormGroup({ name: new FormControl(f.name, Validators.required), filterId: new FormControl(f.id) }));
      });
      this.setFilteredList();
    });
  }
  removeHiddenSensors(list: string[]): string[] {
    let result = list?.filter(v => {
      let isHidden = true;
      SensorComponent.sensorList.forEach(s => {
        if (v === s.sensor) {
          isHidden = s.hidden;
          exit;
        }
      });
      let result = isHidden ? false : true 
      return result;
    });
    return result;
  }
  setFilterModified() { // comparing filter and filterModel values to see if user changed preseted value
    if (this.appliedFilter) {
      let locationChanged = JSON.stringify(this.appliedFilter.locations) !== JSON.stringify(this.filterModel.locations);
      let nonHiddenFilterSensors = this.removeHiddenSensors(this.appliedFilter.sensors).sort();
      let nonHiddenModelSensors = this.removeHiddenSensors(this.filterModel.sensors).sort();
      let sensorsChanged = JSON.stringify(nonHiddenFilterSensors) !==  JSON.stringify(nonHiddenModelSensors);
      let timeChanged = JSON.stringify(this.appliedFilter.time) !== JSON.stringify(this.filterModel.time);
      this.filterValueModified = locationChanged || sensorsChanged || timeChanged;
    } else {
      this.filterValueModified = false;
    }
  }
  listenForUserPresetChange() {
    let locationSubs = this.filterModel.locationFilterChangedBus;
    let sensorSubs = this.filterModel.sensorFilterChangedBus;
    let timeSubs = this.filterModel.timeFiterChangedBus;

    from([locationSubs, sensorSubs, timeSubs]).pipe(mergeAll()).subscribe(v => {
      this.setFilterModified();
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.fetchFilterList();
    this.dataStorageService.usubscribeBroadcastBus.subscribe(v => { //prevents drawing feaures (dots) outside poligon
      this.subscription?.unsubscribe();
    });
    this.listenForUserPresetChange();
  }
  delayFetchData() {
    this.subscription = this.dataStorageService.fetchData(this.filterModel);
  }
  setAppliedFilter(filter: any): void {
    this.appliedFilter = filter;
  }
  findFilterDataForControl(fc: FormGroup): any {
    let result = this.filters.find((v: any) => {
      return v.id === fc.controls['filterId'].value
    });
    return result;
  }
  deleteControl(filterId: string): void {
    let ind = this.unfilteredFormArray.controls.findIndex((v: FormGroup) => {
      return v.controls['filterId'].value === filterId
    });
    this.unfilteredFormArray.removeAt(ind);
    this.setFilteredList()
  }
  findControlForFilterData(data: any): FormGroup {
    let result = this.unfilteredFormArray.controls.find((v: FormGroup) => {
      return v.controls['filterId'].value === data['id'];
    });
    return result as FormGroup;
  }
  applyFilter(fc: any) {
    let filterData = this.findFilterDataForControl(fc);
    this.setAppliedFilter(filterData);
    this.dataStorageService.presetChangedBus.next(filterData);
    setTimeout(() => { this.delayFetchData() }, 1000); // setting presets is async so ill just wait a little before getting data, hope Tihomir doesen't see this hack :)
  }
  openAlertSettingsDialog(fc: any): void {
    let filterData = this.findFilterDataForControl(fc);
    const dialogRef = this.dialog.open(AlertComponent, { data: filterData, minWidth: '340px' });
    this.setDialogIsOpen(true);
    dialogRef.afterClosed().subscribe(result => {
      this.setDialogIsOpen(false);
    });
  }
  setDialogIsOpen(isOpen: boolean) {
    this.dialogIsOpen = isOpen;
  }
  getLabel(): string {
    return !!this.appliedFilter ? this.appliedFilter.name : 'Presets';
  }
  saveAsCurrentFilter(): void {
    if (!!!this.appliedFilter) {
      this.showInfoMessage(this.dialog, Constants.MSG_SELECT_FILTER).afterClosed().subscribe(result => {
        this.setDialogIsOpen(false);
      });
      this.setDialogIsOpen(true);
      return;
    }
    let dialog = this.showConfirmationDialog(this.dialog, '"' + this.getLabel() + '"' + ' will be overwritten, continue?');
    this.setDialogIsOpen(true);
    dialog.afterClosed().subscribe(result => {
      this.setDialogIsOpen(false);
      if (result) {
        let newName = this.findControlForFilterData(this.appliedFilter).controls['name'].value;
        this.dataStorageService.updateFilterMetaData(newName, this.appliedFilter.id, this.appliedFilter.enabled,
          this.appliedFilter.action, this.appliedFilter.visibility, this.filterModel).subscribe(v => {
            this.appliedFilter.name = newName;
            this.fetchFilterList();
            this.messageService.showMessage(Constants.MSG_FILTER_OVERWRITTEN, MessageColor.Green);
          }, e => {
            console.error(e)
            this.messageService.showErrorMessage(e);
          });
      }
    });
  }
  saveNewFilterClick(e: any): void {
    this.dataStorageService.saveFilterAs(this.presetForm.controls['newFilterName'].value, false, "email", "private", this.filterModel).subscribe(v => {

      this.showInfoMessage(this.dialog, Constants.MSG_FILTER_ADDED).afterClosed().subscribe(result => {
        this.setDialogIsOpen(false);
      });
      this.setDialogIsOpen(true);
      this.fetchFilterList();
    }, e => {
      console.error(e)
      this.messageService.showErrorMessage(e);
    })
  }
  deleteFilter(): void {
    let d = this.showConfirmationDialog(this.dialog, "Delete '" + this.appliedFilter?.name + "' ?");
    this.setDialogIsOpen(true);
    d.afterClosed().subscribe(d => {
      this.setDialogIsOpen(false);
      if (d) {
        if (this.appliedFilter) {
          this.dataStorageService.deleteFilter(this.appliedFilter.id + '').then(v => {

            this.showInfoMessage(this.dialog, '"' + this.appliedFilter.name + '" deleted').afterClosed().subscribe(result => {
              this.setDialogIsOpen(false);
            });
            this.setDialogIsOpen(true);
            this.deleteControl(this.appliedFilter.id);
            this.setAppliedFilter(null);
          }, e => {
            console.error(e)
            this.messageService.showErrorMessage(e);
          })
        }
      }
    });
  }
  markAppliedFilterRow(rowFilter: any): boolean {
    let result = rowFilter === this.appliedFilter;
    return result;
  }
  setFilteredList(): void {
    this.filteredFormArray.clear();
    let result = this.unfilteredFormArray.controls.filter((v: FormGroup) => {
      return (v.controls['name'].value as string).toUpperCase().indexOf(this.searchFilter.toUpperCase()) === 0
    });
    result.forEach(v => {
      this.filteredFormArray.push(v);
    });
  }
  searchPresetFilters(e: any) {
    this.searchFilter = e ? e.target.value : '';
    this.searchFilter = this.searchFilter.trim();
    this.setFilteredList();
  }
  disableNewFilter(): boolean {
    return !this.appliedFilter;
  }
}
