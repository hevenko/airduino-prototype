import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { FilterModel } from 'src/app/model/filter-model';
import { Constants } from 'src/app/shared/constants';
import { FormIntactChecker } from 'src/app/shared/FormIntactChecker';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { MessageService } from 'src/app/shared/service/message.service';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit, AfterViewInit {
  static filterTypeSliding = "sliding_range";
  static filterTypeCustom = "custom_range";
  static filterTypeFixed = "fixed_range";

  defaultLabel = 'Time period';
  hoursTime = [
    { value: 'PT1H', desc: 'Last hour' },
    { value: 'PT3H', desc: 'Last 3 hours' },
    { value: 'PT12H', desc: 'Last 12 hours' },
    { value: 'PT14H', desc: 'Last 24 hours' },
    { value: 'P1W', desc: 'Last week' },
    { value: 'P5Y', desc: 'Last 5 years' }
  ];
  
  intervalEnd = { 'interval': 'PT0S' };

  customTimeUnits = [
    { value: 'PT?H', desc: 'Hour' },
    { value: 'P?D', desc: 'Day' },
    { value: 'P?W', desc: 'Week' },
    { value: 'P?Y', desc: 'Year' }
  ];
  timeForm: FormGroup = new FormGroup({});
  _formIntactChecker: FormIntactChecker;
  _isIntact: boolean;
  _rs = new ReplaySubject<boolean>();
  _label;
  static label;
  date: any;
  @ViewChild('customTime') customTime: ElementRef;
  calendarIsOpen: boolean = false;
  hourRangeIsOpen: boolean = false;
  stayOpened = Constants.STAY_OPEN;
  subscription;
  fetchDataSetTimeout;
  setCloseMenuClass = false;

  @ViewChild('pickerInput') pickerInput: any;

  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel, private messageService: MessageService) { }

  ngOnInit(): void {
    this.label = this.defaultLabel;
    this.filterModel.timeFiterChangedBus.next(null); //to show default label on filter-info component
    this.initForm();
    Constants;
    this.subscribeToPreseting();
  }
  ngAfterViewInit() {
  }
  get isIntact(): boolean {
    return this._rs ? this._isIntact : this._formIntactChecker.lastIntact;
  };
  setupFormIntactChecker() {
    if (this._rs) {
      this._rs.subscribe((isIntact: boolean) => {
        this._isIntact = isIntact;
        if (isIntact) { // form is intact
          this.timeForm.markAsPristine();
        } else { // form is dirty
        }
      })
    }

    this._formIntactChecker = new FormIntactChecker(this.timeForm, this._rs);
    this._formIntactChecker.markIntact();

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
        this.filterModel.time = { from: { interval: this.timeForm.value.slidingRange }, to: this.intervalEnd };
      } else if (!!this.timeForm.value.customRange && !!this.timeForm.value.customRangeUnits) {
        this.filterModel.time = { from: { interval: (this.timeForm.value.customRangeUnits as string).replace('?', this.timeForm.value.customRange) } };
      } else if (!!this.timeForm.value.fixedRange && !!this.timeForm.value.fixedRange.begin && !!this.timeForm.value.fixedRange.end) {
        this.filterModel.time = { from: { date: this.timeForm.value.fixedRange.begin }, to: { date: this.timeForm.value.fixedRange.end } }
      } else {
        this.filterModel.time = null;
      }
    });
    let initValue = this.hoursTime[0];
    this.timeForm.controls.slidingRange.setValue(initValue.value);
    this.setSlidingRange(initValue);
    this.dataStorageService.allMenusClosedBus.subscribe(b => {
      if (Constants.TIME_MENU_LAST_CLOSED === b && !this.isIntact) {
        this.fetchData();
        this._formIntactChecker.markIntact();
      }
    });
    this.dataStorageService.usubscribeBroadcastBus.subscribe(v => { //prevents drawing feaures (dots) outside poligon
      if (Constants.UNSUB_SRC_TIME_COMPONENT !== v) {
        this.subscription?.unsubscribe();
      }
    });
    this.setupFormIntactChecker();
  }
  fetchData = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.subscription = this.dataStorageService.fetchData(this.filterModel);
  }
  setSlidingRange(e: any) {
    this.filterModel.timeFilterType = TimeComponent.filterTypeSliding; // time filter type
    //default label when nothing selected
    this.label = this.hoursTime.filter((v) => { return v.value === e.value }).map((v, i) => { return v.desc !== '' ? v.desc : this.defaultLabel })[0];
    this.deleteOtherValues(true, false, false, false);
    //this.fetchData();
  }
  setCustomRange(value: string, timeUnit: string) {
    this.filterModel.timeFilterType = TimeComponent.filterTypeCustom; // time filter type
    // console.log(evt);
    if (!!value && !!timeUnit) {
      this.label = value + ' ' + this.customTimeUnits.filter((v) => { return v.value === timeUnit })[0].desc;
    } else {
      this.label = this.defaultLabel;
    }
    this.deleteOtherValues(false, true, true, false);
    clearTimeout(this.fetchDataSetTimeout);
    //this.fetchDataSetTimeout = setTimeout(this.fetchData,1500);
  }
  fixedRangeChanged(evt: any) {
    let newRange = evt.targetElement ? evt.targetElement.value : evt.target.value;
    this.setFixedRange(newRange);
  }
  setFixedRange(newRange: any) {
    this.filterModel.timeFilterType = TimeComponent.filterTypeFixed; // time filter type
    if (newRange !== '') {
      this.label = newRange?.targetElement.value;
    } else {
      this.label = this.defaultLabel;
    }
    this.deleteOtherValues(false, false, false, true);
    //this.fetchData();
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
  get label() {
    return this._label;
  }
  set label(v: string) {
    this._label = v;
    TimeComponent.label = v;
  }
  closeMenuClass(doClose: boolean) {
    this.setCloseMenuClass = doClose;
  }
  extractCustomInterval(isoRange: string): string[] {
    let result = [];
    isoRange = isoRange.replace('P','');
    if(isoRange.indexOf('H') !== -1) {
      result[0] = this.customTimeUnits[0].value;
      result[1] = isoRange.replace('T','').replace('H','');
    }
    if(isoRange.indexOf('D') !== -1) {
      result[0] = this.customTimeUnits[1].value;
      result[1] = isoRange.replace('D','');
    }
    if(isoRange.indexOf('W') !== -1) {
      result[0] = this.customTimeUnits[2].value;
      result[1] = isoRange.replace('W','');
    }
    if(isoRange.indexOf('Y') !== -1) {
      result[0] = this.customTimeUnits[3].value;
      result[1] = isoRange.replace('Y','');
    }

    return result;
  }
  subscribeToPreseting() {
    this.dataStorageService.presetChangedBus.subscribe(v => {
      let filterTypesAreSupported = false;
      let isFixedRange = v.time_from_type === 'date' && v.time_to_type === 'date';
      let isSlidingRange = v.time_from_type === 'interval' && v.time_to_type === 'interval';
      let isCustomRange = v.time_from_type === 'interval' && !!!v.time_to_type;

      if (isFixedRange || isSlidingRange || isCustomRange) {
        if (isSlidingRange) {
          let intervalTo = v.time?.to?.interval;
          let intervalFrom = v.time?.from?.interval;
          console.log(this.extractCustomInterval(intervalTo));
          if (intervalTo && intervalFrom) {
            let filter = this.hoursTime.filter(ht => {
              return ht.value === intervalFrom;
            });
            if (filter && filter.length == 1 && this.intervalEnd.interval === intervalTo) {
              this.setSlidingRange(filter[0]);
              this.timeForm.controls['slidingRange'].setValue(filter[0].value);
            } else {
              this.messageService.showErrorMessage("Unsuported time interval: " + intervalFrom + " - " + intervalTo);
            }
          } else {
            this.messageService.showErrorMessage("No from - to interval in preset: " + v.id);
          }  
        }
        if (isFixedRange) {
          let dateFrom = v.time.from.date;
          let dateTo = v.time.to.date;
          this.timeForm.controls['fixedRange'].setValue({'begin': dateFrom, 'end': dateTo});
          this.setFixedRange(this.pickerInput.nativeElement.value);
        }
        if (isCustomRange) {
          let intervalFrom = v.time?.from?.interval;
          let parts = this.extractCustomInterval(intervalFrom);
          this.setCustomRange(parts[1], parts[0]);
        }
        this._formIntactChecker.markIntact();
      } else {
        this.messageService.showErrorMessage("Unsuported time preset combination: " + v.time_from_type + ', ' + v.time_to_type);
      }
    });
  }
}
