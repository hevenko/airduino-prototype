import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit, AfterViewInit {
  hoursTime = [
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
  defaultLabel = 'Time period';
  label = this.defaultLabel;
  date: any;
  @ViewChild('customTime') customTime: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.initForm();
  }
  ngAfterViewInit() {
  }
  initForm() {
    this.timeForm = new FormGroup({
      predefined: new FormControl(),
      custom: new FormControl(),
      customUnits: new FormControl()
    })
  }
  setVariableTimeLabel(ind: number) {    
    this.label = this.hoursTime[ind].desc;
    this.clearCustomTime();
  }
  setCustomTimeLabel(value: string, timeUnit: number) {
    // console.log(evt);
    if (value !== '') {
      this.label = value + ' ' + this.customTimeUnits[timeUnit].desc;
    } else {
      this.label = this.defaultLabel;
    }
  }
  setFixedTimeLabel(evt: any) {
    if (evt.target.value !== '') {
      this.label = evt.targetElement ? evt.targetElement.value : evt.target.value;
    } else {
      this.label = this.defaultLabel;
    }
    this.clearCustomTime();
  }
  popup(str: string) {
    alert(str);
  }
  clearCustomTime() {  
    this.customTime.nativeElement.value = '';
  }
}
