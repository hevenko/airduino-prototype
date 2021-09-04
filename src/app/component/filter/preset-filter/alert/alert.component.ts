import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormGroupName } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { DialogData } from 'src/app/shared/dialog-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { MessageColor, MessageService } from 'src/app/shared/service/message.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  title = 'Filter E';
  
  sensors = [
    {value: '1', desc: 'Suphur dioxide SO2'},
    {value: '2', desc: 'Ozone O3'},
    {value: '3', desc: 'Lead Pb'},
    {value: '4', desc: 'Nitroux oxide NOX'},
    {value: '5', desc: 'Organic burn'}
  ];
  actions = [
    {value: 'email', desc: 'email'},
    {value: 'sms', desc: 'sms'},
  ];
  form: FormGroup;
  sensorArray: FormArray;
  filterSensors: Array<any>;

  constructor(private dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private dataStorageService: DataStorageService, private fb: FormBuilder, private messageService: MessageService ) {
    
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
      this.filterSensors = j[1];
      this.makeSensorList(j[1]);

    });
  }
  makeSensorList(sensorList: Array<any>): void {
    const list = <FormArray>this.form.get('sensors');
    sensorList.forEach(s => {
      list.push(this.makeSensor(s));
    })
  }
  makeSensor(sensorDetail: any): FormGroup {
    return this.fb.group({
      sensor: [sensorDetail.sensor],
      value: [sensorDetail.value],
      minMax: [sensorDetail.min_max]
    })
  }
  saveFilter(e: any): void {
    let obsList = [];
    //console.log(this.form.value)
    // filter's general data (enabled, action)
    obsList.push(this.dataStorageService.updateFilterMetaData(this.data.id, this.form.value.enabled, this.form.value.action));
    // filter's sensor data
    this.sensorArray.controls.map((v, i) => {
      //console.log(v.value);
      obsList.push(this.dataStorageService.updateFilterSensor(this.data.id, v.value.sensor, v.value.value, v.value.minMax));

    });

    forkJoin(obsList).subscribe(a => {
      this.messageService.showMessage("Filter saved", MessageColor.Green);
      this.dialogRef.close(true);
    })
  }
}
