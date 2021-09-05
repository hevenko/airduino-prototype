import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormGroupName } from '@angular/forms';
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
export class AlertComponent implements OnInit {

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
  allSensors: Array<any> = SensorComponent.sensorList;
  fetchedSensorValues: any[]; // fetched from data base

  constructor(private dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private dataStorageService: DataStorageService, private fb: FormBuilder, private messageService: MessageService) {

  }

  ngOnInit(): void {
    let observables = [];
    this.sensorArray = this.fb.array([]);
    this.form = this.fb.group({
      sensors: this.sensorArray,
      enabled: this.fb.control(null),
      action: this.fb.control(null)
    });
    observables.push(this.dataStorageService.fetchFilter(this.data.id));
    observables.push(this.dataStorageService.fetchFilterDetail(this.data.id));

    forkJoin(observables).subscribe(v => {
      console.log(v);
      let j: any = (v as any);
      this.form.controls['enabled'].setValue(j[0].data[0].enabled);
      this.form.controls['action'].setValue(j[0].data[0].action);
      this.fetchedSensorValues = j[1];
      this.makeSensorList(this.allSensors, this.fetchedSensorValues);

    });
  }
  findSensorValue(sensorName: string, sensorValues: Array<any>) {
    let result = sensorValues.map((v) => {
      return v.sensor === sensorName ? v : null
    }).filter(v => {
      return !!v
    });
    return result[0];
  }
  makeSensorList(sensorList: Array<any>, sensorValues: Array<any>): void {
    const list = <FormArray>this.form.get('sensors');
    sensorList.forEach(s => {
      this.sensorArray.push(this.makeSensor(s, this.findSensorValue(s.sensor, sensorValues)));
    })
  }
  makeSensor(sensorDetail: any, sensorValue: any): FormGroup {
    let result: FormGroup = this.fb.group({
      sensor: [sensorDetail.sensor],
      value: [!!sensorValue ? sensorValue.value : null],
      minMax: [!!sensorValue ? sensorValue.min_max : null]
    });
    result.controls['value'].valueChanges.subscribe(v => {
      if (!v) {
        result.controls['minMax'].setValue(null);
        result.controls['minMax'].disable();
      } else if (!result.controls['minMax'].value) {
        result.controls['minMax'].enable();
        result.controls['minMax'].setValue('min');
      }
    })
    return result;
  }
  sensorExists(sensorName: string): boolean {
    let result = false;
    this.fetchedSensorValues.forEach(v => {
      if (sensorName === v.sensor) {
        result = true;
        return;
      }
    });
    return result;
  }
  saveFilter(e: any): void {
    let obsList = [];

    obsList.push(this.dataStorageService.updateFilterMetaData(this.data.id, this.form.value.enabled, this.form.value.action));    // general data like enabled, action

    this.sensorArray.controls.map((v, i) => { // sensor data
      //console.log(v.value);
      if(v.value.value) { // handles !!0 beeing false
        if(this.sensorExists(v.value.sensor)) {
          obsList.push(this.dataStorageService.updateFilterSensor(this.data.id, v.value.sensor, v.value.value, v.value.minMax));
        } else {
          obsList.push(this.dataStorageService.createFilterSensor(this.data.id, v.value.sensor, v.value.value, v.value.minMax));
        }
      } else {
        obsList.push(this.dataStorageService.deleteFilterSensor(this.data.id, v.value.sensor));
      }

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
}
