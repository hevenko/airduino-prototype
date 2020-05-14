import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/shared/constants';
import { filter } from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';

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
  defaultLabel = 'Time period';
  label = this.defaultLabel;
  dialogIsOpen = false;
  presetForm: FormGroup = new FormGroup({});

  constructor() { }
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
}
