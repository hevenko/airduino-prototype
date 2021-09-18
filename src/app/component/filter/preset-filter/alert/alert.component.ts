import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
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
  sensorArray: FormArray;
  allSensors: Array<any>;
  fetchedSensorValues: any[]; // fetched from data base
  selectedRow: FormGroup;
  sensorList: any[];
  CRUD_CREATED = 'C'; // stored in db
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
      this.sensorArray.push(this.makeSensor(s, this.CRUD_CREATED, i));
    })
  }
  makeSensor(sensorDetail: any, crud: string, localId: number): FormGroup {
    return this.fb.group({
      localId: [localId],
      crud: [crud],
      primKey: [sensorDetail],
      sensor: [sensorDetail.sensor],
      value: [sensorDetail.value],
      minMax: [sensorDetail.min_max]
    })
  }
  saveFilter(e: any): void {
    let obsList = [];

    obsList.push(this.dataStorageService.updateFilterMetaData(this.data.id, this.form.value.enabled, this.form.value.action, this.form.value.visibility));    // general data like enabled, action

    this.sensorArray.controls.map((v, i) => { // sensor data
      console.log(JSON.stringify(v.value));
      //obsList.push(this.dataStorageService.updateFilterSensor(this.data.id, v.value.sensor, v.value.value, v.value.minMax));

    });
    forkJoin(obsList).subscribe(a => {
      this.messageService.showMessage("Filter saved", MessageColor.Green);
      this.dialogRef.close(true);
    },
      e => {
        console.error(e)
        this.messageService.showErrorMessage(Constants.SAVE_ERROR);
      });
  }
  setSelectedRow(r: any):void {
    this.selectedRow = r;
  }
  isSelectedRow(r: any): boolean {
    return r === this.selectedRow;
  }
  addNewSensor(): void {
    this.selectedRow = this.makeSensor({filter: this.data.id, sensor: '', value: '', min_max: ''}, this.CRUD_INSERTED, this.sensorArray.length);
    this.sensorArray.insert(0, this.selectedRow);

    this.sensorArray.controls.forEach((v: FormGroup, i) =>{
      v.controls['localId'].setValue(i); // new sensor was added first so localId's (index) are reset 
    });
  }
  deleteSensor(): void {
    if (this.selectedRow.value.crud === this.CRUD_CREATED) {
      this.selectedRow.controls['crud'].setValue(this.CRUD_DELETED);
    } else {
      this.sensorArray?.controls.splice(this.selectedRow.value.localId, 1);
    }
  }
  getSensorList(): any[] {
    return this.sensorArray?.controls.filter(v => {
      return v.value.crud !== this.CRUD_DELETED;
    })
  }
}
