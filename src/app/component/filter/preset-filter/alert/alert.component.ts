import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, concat, EMPTY, forkJoin, from, Observable, of, throwError } from 'rxjs';
import { catchError, concatAll, concatMap, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { Constants } from 'src/app/shared/constants';
import { DialogData } from 'src/app/shared/dialog-data';
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
  sensorArray: FormArray = new FormArray([]);
  allSensors: Array<any>;
  fetchedSensorValues: any[]; // fetched from data base
  selectedRow: FormGroup;
  sensorList: any[];
  CRUD_STORED = 'S'; // stored in db
  CRUD_INSERTED = "I"; // newly inserted
  CRUD_DELETED = 'D'; // should be deleted from db

  constructor(private dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private dataStorageService: DataStorageService, private fb: FormBuilder, private messageService: MessageService) {

  }

  ngOnInit(): void {
    let observables = [];
    this.sensorArray = this.fb.array([]);
    this.form = this.fb.group({
      sensors: this.sensorArray,
      enabled: this.fb.control(null),
      action: this.fb.control(null),
      visibility: this.fb.control('private')
    });
    observables.push(this.dataStorageService.fetchFilter(this.data.id));
    observables.push(this.dataStorageService.fetchFilterDetail(this.data.id));

    forkJoin(observables).subscribe(v => {
      console.log(v);
      let j: any = (v as any);
      this.form.controls['enabled'].setValue(j[0].data[0].enabled);
      this.form.controls['action'].setValue(j[0].data[0].action);
      this.form.controls['visibility'].setValue(j[0].data[0].visibility);
      this.fetchedSensorValues = j[1];
      this.allSensors = j[1];
      this.makeSensorList(j[1]);
    });
    this.sensorList = SensorComponent.sensorList.filter(v => {
      return !v.hidden;
    });
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
    let insertList = []
    obsList.push(this.dataStorageService.updateFilterMetaData(this.data.id, this.form.value.enabled, this.form.value.action, this.form.value.visibility));    // general data like enabled, action

    this.sensorArray.controls.map((v, i) => { // sensor data
      console.log(JSON.stringify(v.value));
      if (v.value.crud === this.CRUD_INSERTED) {
        insertList.push(this.dataStorageService.createFilterSensor(v.value.primKey.filter, v.value.sensor, v.value.value, v.value.minMax));
        //deleteList.push(this.dataStorageService.deleteFilterSensor(v.value.primKey.filter, v.value.primKey.sensor));
      } else if (v.value.crud === this.CRUD_DELETED) {
        deleteList.push(this.dataStorageService.deleteFilterSensor(v.value.primKey.filter, v.value.primKey.sensor, v.value.primKey.min_max).pipe(catchError(this.handleError)));
      } else if (v.value.crud === this.CRUD_STORED) { // fetched  from db
        if (v.dirty) {
          deleteList.push(this.dataStorageService.deleteFilterSensor(v.value.primKey.filter, v.value.primKey.sensor, v.value.primKey.min_max).pipe(catchError(this.handleError)));
          insertList.push(this.dataStorageService.createFilterSensor(v.value.primKey.filter, v.value.sensor, v.value.value, v.value.minMax).pipe(catchError(this.handleError)));
        } else {
          // sensor was not changed by user
        }
      }
      //obsList.push(this.dataStorageService.updateFilterSensor(this.data.id, v.value.sensor, v.value.value, v.value.minMax));

    });
    let all = [];
    all = all.concat(obsList, deleteList, insertList);
    from(all).pipe(
      concatAll()).pipe(toArray()).subscribe(v => {
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
    this.form.updateValueAndValidity();
    this.resetInd();
  }
  deleteSensor(): void {
    if (this.selectedRow) {
      if (this.selectedRow.value.crud === this.CRUD_STORED) {
        this.selectedRow.controls['crud'].setValue(this.CRUD_DELETED);
      } else {
        this.sensorArray?.controls.splice(this.selectedRow.value.sensorInd, 1);
        this.resetInd();
      }
    } else {
      this.messageService.showErrorMessage(Constants.SELECT_SENSOR_ERROR);
    }
  }
  getSensorList(): any[] {
    return this.sensorArray?.controls.filter(v => {
      return v.value.crud !== this.CRUD_DELETED;
    })
  }
}
