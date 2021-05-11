import {Component, OnInit} from '@angular/core';
import {Constants} from 'src/app/shared/constants';
import {filter} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AlertComponent} from './alert/alert.component';
import {AirduinoComponent} from '../../airduino/airduino.component';
import {MessageService, MessageColor} from 'src/app/shared/service/message.service';

@Component({
  selector: 'app-preset-filter',
  templateUrl: './preset-filter.component.html',
  styleUrls: ['./preset-filter.component.css']
})
export class PresetFilterComponent extends AirduinoComponent implements OnInit  {
  stayOpened = Constants.STAY_OPEN;
  filters = [
    {value: '1', desc: 'Filter A'},
    {value: '2', desc: 'Filter B'},
    {value: '3', desc: 'Da li sused kuri kakvu plastiku'},
    {value: '4', desc: 'Long named filter'},
    {value: '5', desc: 'Prijatelu sam hakiral uređaje, daj njih'},
    {value: '6', desc: 'Svi uređaji'},
    {value: '7', desc: 'Samo tam gdi je fejst vruće'},
    {value: '8', desc: 'Pravni slučaj jedan'},
    {value: '9', desc: 'Skladište'},
    {value: '10', desc: 'Autobusni'},
  ];
  dialogIsOpen = false;
  presetForm: FormGroup = new FormGroup({});
  filterEnabledIcon = 'report_problem';
  appliedFilter = null;
  showSaveAsNewFilterBtn = false;
  newFilterName = '';

  constructor(public dialog: MatDialog, private messageService: MessageService) {
    super();
  }

  initForm() {
    this.presetForm = new FormGroup({
      newFilterName: new FormControl()
    });
  }
  ngOnInit(): void {
    this.initForm();
  }
  applyFilter(f: any) {
    this.appliedFilter = f;
  }
  searchPresetFilters() {
    alert('ya')
  }
  openAlertSettingsDialog(): void {
    const dialogRef = this.dialog.open(AlertComponent);
    this.setDialogIsOpen(true);
    dialogRef.afterClosed().subscribe(result => {
      this.setDialogIsOpen(false);
    });
  }
  setDialogIsOpen(isOpen: boolean) {
    this.dialogIsOpen = isOpen;
  }
  getLabel(): string {
    return !!this.appliedFilter ? this.appliedFilter.desc : 'Presets';
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
}
