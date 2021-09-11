import {Component, OnInit} from '@angular/core';
import {Constants} from 'src/app/shared/constants';
import {filter} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AlertComponent} from './alert/alert.component';
import {AirduinoComponent} from '../../airduino/airduino.component';
import {MessageService, MessageColor} from 'src/app/shared/service/message.service';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-preset-filter',
  templateUrl: './preset-filter.component.html',
  styleUrls: ['./preset-filter.component.css']
})
export class PresetFilterComponent extends AirduinoComponent implements OnInit  {
  stayOpened = Constants.STAY_OPEN;
  filters = [
    {id: '1', name: 'Filter A'},
    {id: '2', name: 'Filter B'},
    {id: '3', name: 'Da li sused kuri kakvu plastiku'},
    {id: '4', name: 'Long named filter'},
    {id: '5', name: 'Prijatelu sam hakiral uređaje, daj njih'},
    {id: '6', name: 'Svi uređaji'},
    {id: '7', name: 'Samo tam gdi je fejst vruće'},
    {id: '8', name: 'Pravni slučaj jedan'},
    {id: '9', name: 'Skladište'},
    {id: '10', name: 'Autobusni'},
  ];
  dialogIsOpen = false;
  presetForm: FormGroup = new FormGroup({});
  filterEnabledIcon = 'report_problem';
  appliedFilter = null;
  showSaveAsNewFilterBtn = false;
  newFilterName = '';

  constructor(public dialog: MatDialog, private messageService: MessageService, private dataStorageService: DataStorageService) {
    super();
  }

  initForm() {
    this.presetForm = new FormGroup({
      newFilterName: new FormControl()
    });
  }
  fetchFilterList(): void {
    this.dataStorageService.fetchFilterList().then(l => { // filter list
      this.filters = l;
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.fetchFilterList();
  }
  applyFilter(f: any) {
    this.appliedFilter = f;
    this.dataStorageService.presetChangedBus.next(f);
  }
  searchPresetFilters() {
    alert('ya')
  }
  openAlertSettingsDialog(filter: any): void {
    const dialogRef = this.dialog.open(AlertComponent, {data : filter});
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
        this.messageService.showMessage(Constants.MSG_FILTER_OVERWRITTEN, MessageColor.Green);
      }
    });
  }
  saveNewFilterClick(e:any): void {
    this.showInfoMessage(this.dialog, Constants.MSG_FILTER_ADDED).afterClosed().subscribe(result => {
      this.setDialogIsOpen(false);
      this.presetForm.patchValue({newFilterName: ''});
    });
    this.setDialogIsOpen(true);
  }
  markAppliedFilterRow(rowFilter: any): boolean {
    let result = rowFilter === this.appliedFilter;
    return result;
  }
}
