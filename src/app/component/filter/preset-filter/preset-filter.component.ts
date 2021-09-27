import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/shared/constants';
import { filter } from 'rxjs/operators';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertComponent } from './alert/alert.component';
import { AirduinoComponent } from '../../airduino/airduino.component';
import { MessageService, MessageColor } from 'src/app/shared/service/message.service';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { FilterModel } from 'src/app/model/filter-model';
import sub from 'date-fns/sub';
import { Subscription } from 'rxjs';

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
  appliedFilterInd: string = '';
  showSaveAsNewFilterBtn = false;
  newFilterName = '';
  subscription;
  filters = [];
  filterNameArray = new FormArray([]);
  newFilterNameControl = new FormControl('', Validators.required);

  constructor(public dialog: MatDialog, private messageService: MessageService, private dataStorageService: DataStorageService, private filterModel: FilterModel) {
    super();
  }

  initForm() {
    this.presetForm = new FormGroup({
      nameArray: this.filterNameArray,
      newFilterName: this.newFilterNameControl
    });
  }
  fetchFilterList(): void {
    this.appliedFilterInd = '';
    this.appliedFilter = null;
    this.filterNameArray.controls = [];
    let s = this.dataStorageService.fetchFilterList().then(l => { // filter list
      this.filters = l;
      this.filters.forEach(f => {
        this.filterNameArray.push(new FormControl(f.name));
      });
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.fetchFilterList();
    this.dataStorageService.usubscribeBroadcastBus.subscribe(v => { //prevents drawing feaures (dots) outside poligon
      this.subscription?.unsubscribe();
    });
  }
  delayFetchData() {
    this.subscription = this.dataStorageService.fetchData(this.filterModel);
  }
  applyFilter(f: any, ind: number) {
    this.appliedFilterInd = ind + '';
    this.appliedFilter = f;
    this.dataStorageService.presetChangedBus.next(f);
    setTimeout(() => { this.delayFetchData() }, 1000); // setting presets is async so ill just wait a little before getting data, hope Tihomir doesen't see this hack :)
  }
  searchPresetFilters() {
    alert('ya')
  }
  openAlertSettingsDialog(filter: any): void {
    const dialogRef = this.dialog.open(AlertComponent, { data: filter, minWidth: '340px' });
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
        let newName = this.filterNameArray.controls[this.appliedFilterInd].value;
        this.dataStorageService.updateFilterMetaData(newName, this.appliedFilter.id, this.appliedFilter.enabled,
          this.appliedFilter.action, this.appliedFilter.visibility, this.filterModel).subscribe(v => {
            this.appliedFilter.name = newName;
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
  markAppliedFilterRow(rowFilter: any): boolean {
    let result = rowFilter === this.appliedFilter;
    return result;
  }
  getFilterNameControls(): any[] {
    return this.filterNameArray.controls;
  }
  disableNewFilter(): boolean {
    return !this.appliedFilter;
  }
  deleteFilter(): void {
    if (this.appliedFilter) {
      this.dataStorageService.deleteFilter(this.appliedFilter.id + '').then(v => {

        this.showInfoMessage(this.dialog, '"' + this.appliedFilter.name + '" deleted').afterClosed().subscribe(result => {
          this.setDialogIsOpen(false);
        });
        this.setDialogIsOpen(true);
        this.fetchFilterList();
      }, e => {
        console.error(e)
        this.messageService.showErrorMessage(e);
      })
    }

  }
}
