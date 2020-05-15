import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/shared/constants';
import { filter } from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AlertComponent } from './alert/alert.component';

@Component({
  selector: 'app-preset-filter',
  templateUrl: './preset-filter.component.html',
  styleUrls: ['./preset-filter.component.css']
})
export class PresetFilterComponent implements OnInit {
  stayOpened = Constants.STAY_OPEN;
  filters = [
    {value: '1', desc: 'Filter A'},
    {value: '2', desc: 'Filter B'},
    {value: '3', desc: 'Da li sused kuri kakvu plastiku'},
    {value: '4', desc: 'Long named filter'},
    {value: '5', desc: 'Prijatelu sam hakiral uređaje, daj njih'}
  ];
  defaultLabel = 'Presets';
  label = this.defaultLabel;
  dialogIsOpen = false;
  presetForm: FormGroup = new FormGroup({});
  filterEnabledIcon = 'report_problem';

  constructor(public dialog: MatDialog) { }

  initForm() {
    this.presetForm = new FormGroup({});
  }
  ngOnInit(): void {
  }
  setLabel(i: number) {
    this.label = this.filters[i].desc;
  }
  searchPresetFilters() {
    alert('ya')
  }
  openAlertSettingsDialog(): void {
    const dialogRef = this.dialog.open(AlertComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
