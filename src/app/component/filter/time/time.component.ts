import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit, AfterViewInit {
  values = [
    {value: '1', desc: 'Last hour'},
    {value: '2', desc: 'Last 3 hours'},
    {value: '3', desc: 'Last 12 hours'},
    {value: '4', desc: 'Last 24 hours'},
    {value: '5', desc: 'Last week'}
  ];tref

  timeForm: FormGroup = new FormGroup({});
  label = 'Period';
  
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
  setLabel(ind: number) {
    this.label = this.values[ind].desc;
  }
  popup(str: string) {
    alert(str);
  }
}
