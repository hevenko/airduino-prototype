import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Constants } from 'src/app/shared/constants';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit, AfterViewInit {
  defaultLabel = 'Time period';
  hoursTime = [
    {value: '', desc: ''},
    {value: '1', desc: 'Last hour'},
    {value: '2', desc: 'Last 3 hours'},
    {value: '3', desc: 'Last 12 hours'},
    {value: '4', desc: 'Last 24 hours'},
    {value: '5', desc: 'Last week'}
  ];
  customTimeUnits = [
    {value: '0', desc: 'Hours'},
    {value: '1', desc: 'Days'},
    {value: '2', desc: 'Weeks'},
    {value: '3', desc: 'Years'}
  ];
  timeForm: FormGroup = new FormGroup({});
  label = this.defaultLabel;
  date: any;
  @ViewChild('customTime') customTime: ElementRef;
  calendarIsOpen: boolean = false;
  hourRangeIsOpen: boolean = false;
  stayOpened = Constants.STAY_OPEN;

  constructor() { }

  ngOnInit(): void {
    this.initForm();
    Constants
  }
  ngAfterViewInit() {
  }
  initForm() {
    this.timeForm = new FormGroup({
      predefined: new FormControl(),
      custom: new FormControl(),
      customUnits: new FormControl(),
      fixedTimeRange: new FormControl(),
    })
  }
  setVariableTimeLabel(e: any) {
    this.label = this.hoursTime.filter((v) => {return v.value === e.value}).map((v, i) => {return v.desc !== '' ? v.desc : this.defaultLabel})[0];
    this.clearCustomTime();
    //this.setComponentValue(this.hoursTime[ind].value, null, null, {begin: new Date(2018, 7, 5), end: new Date(2018, 7, 25)});
  }
  setCustomTimeLabel(value: string, timeUnit: number) {
    // console.log(evt);
    if (value !== '') {
      this.label = value + ' ' + this.customTimeUnits[timeUnit].desc;
    } else {
      this.label = this.defaultLabel;
    }
    this.setComponentValue(null, value, this.customTimeUnits[timeUnit].value, null);
  }
  setFixedTimeLabel(evt: any) {
    if (evt.target.value !== '') {
      this.label = evt.targetElement ? evt.targetElement.value : evt.target.value;
    } else {
      this.label = this.defaultLabel;
    }
    this.clearCustomTime();
    this.setComponentValue(null, null, null, this.label);
  }
  popup(str: string) {
    alert(str);
  }
  clearCustomTime() {
    this.customTime.nativeElement.value = '';
  }
  setCalendarIsOpen(isopened: boolean) {
    this.calendarIsOpen = isopened;
  }
  setComponentValue(variableTimeRange: string, customTime: string, customTimeUnit: string, fixedTimeRange: any) {
    this.timeForm.patchValue({predefined: variableTimeRange, custom: customTime, customUnits: customTimeUnit, fixedTimeRange: fixedTimeRange});
    console.log(this.timeForm.value);
    //10/13/2020 - 10/16/2020
    //{begin: Tue Oct 13 2020 00:00:00 GMT+0200 (Central European Summer Time), end: Fri Oct 16 2020 00:00:00 GMT+0200 (Central European Summer Time)}

  }
  shouldStayOpen(): boolean {
    return this.calendarIsOpen || this.hourRangeIsOpen;
  }
  // prevents mat-select from closing menu upon value select
  hourRangeOnOpen(e: boolean): void {
    this.hourRangeIsOpen = e;
  }
}
