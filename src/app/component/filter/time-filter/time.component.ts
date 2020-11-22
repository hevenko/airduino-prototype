import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterModel } from 'src/app/model/filter-model';
import { Constants } from 'src/app/shared/constants';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit, AfterViewInit {
  defaultLabel = 'Time period (?)';
  hoursTime = [
    {value: '', desc: ''},
    {value: 'PT1H', desc: 'Last hour'},
    {value: 'PT3H', desc: 'Last 3 hours'},
    {value: 'PT12H', desc: 'Last 12 hours'},
    {value: 'PT14H', desc: 'Last 24 hours'},
    {value: 'P1W', desc: 'Last week'},
    {value: 'P5Y', desc: 'Last 5 years'}
  ];
  customTimeUnits = [
    {value: 'PT?H', desc: 'Hour'},
    {value: 'P?D', desc: 'Day'},
    {value: 'P?W', desc: 'Week'},
    {value: 'P?Y', desc: 'Year'}
  ];
  timeForm: FormGroup = new FormGroup({});
  label = this.defaultLabel;
  date: any;
  @ViewChild('customTime') customTime: ElementRef;
  calendarIsOpen: boolean = false;
  hourRangeIsOpen: boolean = false;
  stayOpened = Constants.STAY_OPEN;
  subscription;

  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { }

  ngOnInit(): void {
    this.initForm();
    Constants
  }
  ngAfterViewInit() {
  }
  initForm() {
    this.timeForm = new FormGroup({
      slidingRange: new FormControl(),
      customRange: new FormControl(),
      customRangeUnits: new FormControl(),
      fixedRange: new FormControl()
    })
    this.timeForm.valueChanges.subscribe((v: any) => {
      if (!!this.timeForm.value.slidingRange) {
        this.filterModel.time = {from : {interval : this.timeForm.value.slidingRange}};
      } else if (!!this.timeForm.value.customRange && !!this.timeForm.value.customRangeUnits) {
        this.filterModel.time = {from: {interval : (this.timeForm.value.customRangeUnits as string).replace('?',this.timeForm.value.customRange)}};
      } else if (!!this.timeForm.value.fixedRange && !!this.timeForm.value.fixedRange.begin && !!this.timeForm.value.fixedRange.end) {
        this.filterModel.time = {from: {date :this.timeForm.value.fixedRange.begin}, to: { date: this.timeForm.value.fixedRange.end} }
      } else {
        this.filterModel.time = null;
      }
    });
  }
  fetchData() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.subscription = this.dataStorageService.fetchData();
  }
  setSlidingRange(e: any) {
    //default label when nothing selected
    this.label = this.hoursTime.filter((v) => {return v.value === e.value}).map((v, i) => {return v.desc !== '' ? v.desc : this.defaultLabel})[0];
    this.deleteOtherValues(true, false, false, false);
    this.fetchData();
  }
  setCustomRange(value: string, timeUnit: string) {
    // console.log(evt);
    if (!!value && !!timeUnit) {
      this.label = value + ' ' + this.customTimeUnits.filter((v)=>{return v.value === timeUnit})[0].desc;
    } else {
      this.label = this.defaultLabel;
    }
    this.deleteOtherValues(false, true, true, false);
    this.fetchData();
  }
  setFixedRange(evt: any) {
    if (evt.target.value !== '') {
      this.label = evt.targetElement ? evt.targetElement.value : evt.target.value;
    } else {
      this.label = this.defaultLabel;
    }
    this.deleteOtherValues(false, false, false, true);
    this.fetchData();
  }
  /**
   * deletes form control values whose coresponding param is set to false
   * @param slidingRange 
   * @param customRange 
   * @param customRangeUnits 
   * @param fixedRange 
   */
  deleteOtherValues(slidingRange: boolean, customRange: boolean, customRangeUnits: boolean, fixedRange: boolean): void {
    if (!slidingRange) this.timeForm.controls.slidingRange.setValue(null);
    if (!customRange) this.timeForm.controls.customRange.setValue(null);
    if (!customRangeUnits) this.timeForm.controls.customRangeUnits.setValue(null);
    if (!fixedRange) this.timeForm.controls.fixedRange.setValue(null);
  }
  popup(str: string) {
    alert(str);
  }
  setCalendarIsOpen(isopened: boolean) {
    this.calendarIsOpen = isopened;
  }
  shouldStayOpen(): boolean {
    return this.calendarIsOpen || this.hourRangeIsOpen;
  }
  // prevents mat-select from closing menu upon value select
  hourRangeOnOpen(e: boolean): void {
    this.hourRangeIsOpen = e;
  }
}
