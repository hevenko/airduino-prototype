import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, concat, EMPTY, forkJoin, from, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { catchError, concatAll, concatMap, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { Constants } from 'src/app/shared/constants';
import { DialogData } from 'src/app/shared/dialog-data';
import { FormIntactChecker } from 'src/app/shared/FormIntactChecker';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { MessageColor, MessageService } from 'src/app/shared/service/message.service';
import { SensorComponent } from '../../sensor-filter/sensor.component';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, AfterViewInit {

  title = 'Filter E';

  sensors = [
    { value: '1', desc: 'Suphur dioxide SO2' },
    { value: '2', desc: 'Ozone O3' },
    { value: '3', desc: 'Lead Pb' },
    { value: '4', desc: 'Nitroux oxide NOX' },
    { value: '5', desc: 'Organic burn' }
  ];
  actions = [
    { value: 'email', desc: 'email' },
    { value: 'sms', desc: 'sms' },
  ];
  form: FormGroup;
  _formIntactChecker: FormIntactChecker;
  _isIntact: boolean;
  _rs = new ReplaySubject<boolean>();

  filterGeneralDataForm: FormGroup;
  sensorArray: FormArray = new FormArray([]);
  fetchedSensorValues: any[]; // fetched from data base
  selectedRow: FormGroup;
  sensorList: any[];
  CRUD_STORED = 'S'; // stored in db
  CRUD_INSERTED = "I"; // newly inserted
  CRUD_DELETED = 'D'; // should be deleted from db
  sensorsMarkedForDeletion = [];

  constructor(private dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private dataStorageService: DataStorageService, private fb: FormBuilder, private messageService: MessageService) {

  }
  get isIntact(): boolean {
    return this._rs ? this._isIntact : this._formIntactChecker.lastIntact;
  };
  setupFormIntactChecker() {
    if (this._rs) {
      this._rs.subscribe((isIntact: boolean) => {
        this._isIntact = isIntact;
        if (isIntact) { // form is intact
          this.form.markAsPristine();
        } else { // form is dirty
        }
      })
    }

    this._formIntactChecker = new FormIntactChecker(this.form, this._rs);
  }

  ngOnInit(): void {
    let observables = [];
    this.sensorArray = this.fb.array([]);
    this.filterGeneralDataForm = this.fb.group({
      enabled: this.fb.control(null, Validators.required),
      action: this.fb.control(null, Validators.required),
      visibility: this.fb.control('private', Validators.required)
    });
    this.form = this.fb.group({
      sensors: this.sensorArray,
      meta: this.filterGeneralDataForm
    });
    observables.push(this.dataStorageService.fetchFilter(this.data.id));
    observables.push(this.dataStorageService.fetchFilterDetail(this.data.id));

    forkJoin(observables).subscribe(v => {
      console.log(v);
      let j: any = (v as any);
      let generalDataForm: FormGroup = this.form.controls['meta'] as FormGroup;
      generalDataForm.controls['enabled'].setValue(j[0].data[0].enabled);
      generalDataForm.controls['action'].setValue(j[0].data[0].action);
      generalDataForm.controls['visibility'].setValue(j[0].data[0].visibility);
      this.fetchedSensorValues = j[1];
      this.makeSensorList(j[1]);
      this._formIntactChecker.markIntact();
    });
    this.sensorList = SensorComponent.sensorList.filter(v => {
      return !v.hidden;
    });
    this.setupFormIntactChecker();
  }

  ngAfterViewInit(): void {
  }

  findSensorValue(sensorName: string, sensorValues: Array<any>) {
    let result = sensorValues.map((v) => {
      return v.sensor === sensorName ? v : null
    }).filter(v => {
      return !!v
    });
    return result[0];
  }
  makeSensorList(sensorList: Array<any>): void {
    const list = <FormArray>this.form.get('sensors');
    sensorList.forEach((s, i) => {
      this.sensorArray.push(this.makeSensor(s, this.CRUD_STORED, i));
    })
  }
  makeSensor(sensorDetail: any, crud: string, sensorInd: number): FormGroup {
    return this.fb.group({
      sensorInd: [sensorInd],
      crud: [crud],
      primKey: [sensorDetail],
      sensor: [sensorDetail.sensor, Validators.required],
      value: [sensorDetail.value, Validators.required],
      minMax: [sensorDetail.min_max, Validators.required]
    })
  }
  handleError = (err: HttpErrorResponse) => {
    if (!!err.message) {
      this.messageService.showErrorMessage(err.message);
      return throwError(err.message);
    }
    return throwError(err);
  }

  saveFilter(e: any): void {
    let obsList = [];
    let deleteList = [];
    let insertList = [];
    if(this.filterGeneralDataForm.dirty) {
      obsList.push(this.dataStorageService.updateFilterMetaData(this.data.name, this.data.id,
        this.filterGeneralDataForm.value.enabled, this.filterGeneralDataForm.value.action, this.filterGeneralDataForm.value.visibility));    // general data like enabled, action  
    }

    let allSensors = this.sensorArray.controls.concat(this.sensorsMarkedForDeletion);

    allSensors.map((v, i) => { // sensor data
      if (v.value.crud === this.CRUD_INSERTED) {
        insertList.push({filter: v.value.primKey.filter, sensor: v.value.sensor, value: v.value.value, min_max: v.value.minMax});
      } else if (v.value.crud === this.CRUD_DELETED) {
        deleteList.push(v.value.primKey);
      } else if (v.value.crud === this.CRUD_STORED) { // fetched  from db
        if (v.dirty) {
          deleteList.push(v.value.primKey);
          insertList.push({filter: v.value.primKey.filter, sensor: v.value.sensor, value: v.value.value, min_max: v.value.minMax});
        } else {
          // sensor was not changed by user
        }
      }
    });
    let all = [];
    all = all.concat(obsList, [(this.dataStorageService.deleteFilterSensor(deleteList))], [this.dataStorageService.createFilterSensor(insertList)]);
    from(all).pipe(
      concatAll()).pipe(toArray()).subscribe(v => {
        this._formIntactChecker.markIntact();
        this.messageService.showMessage("Filter saved", MessageColor.Green);
        this.dialogRef.close(true);
      }, e => {
        console.error(e)
        this.messageService.showErrorMessage(e);
      });
  }
  setSelectedRow(r: any): void {
    this.selectedRow = r;
  }
  isSelectedRow(r: any): boolean {
    return r === this.selectedRow;
  }
  /**
   * deleting sensor (with CRUD_STORED) introduces holes in indexs so they need to be reset afterwards
   */
  resetInd(): void {
    this.sensorArray.controls.forEach((v: FormGroup, i) => {
      v.controls['sensorInd'].setValue(i); // new sensor was added or one of newly added sensors was deleted so sensorInd's (index) are reset 
    });
  }
  addNewSensor(): void {
    this.selectedRow = this.makeSensor({ filter: this.data.id, sensor: '', value: '', min_max: '' }, this.CRUD_INSERTED, this.sensorArray.length);
    this.sensorArray.insert(0, this.selectedRow);
    this.resetInd();
    this.form.updateValueAndValidity();
  }
  deleteSensor(): void {
    if (this.selectedRow) {
      if (this.selectedRow.value.crud === this.CRUD_STORED) {
        this.selectedRow.controls['crud'].setValue(this.CRUD_DELETED);
        this.sensorsMarkedForDeletion.push(this.selectedRow);
        this.sensorArray?.removeAt(this.selectedRow.value.sensorInd)
      } else {
        this.sensorArray?.controls.splice(this.selectedRow.value.sensorInd, 1);
        this.resetInd();
      }
      this.selectedRow = null;
      this.form.updateValueAndValidity({emitEvent: true});
    } else {
      this.messageService.showErrorMessage(Constants.SELECT_SENSOR_ERROR);
    }
  }
}
