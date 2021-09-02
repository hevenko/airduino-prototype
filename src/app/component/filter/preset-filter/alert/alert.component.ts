import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupName } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/shared/dialog-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dataStorageService: DataStorageService, private fb: FormBuilder) {
    
  }

  ngOnInit(): void {
    this.sensorArray = this.fb.array([]);
    this.form = this.fb.group({
      sensors: this.sensorArray,
      enabled: this.fb.control(this.data.enabled),
      action: this.fb.control(this.data.action)
    });
    this.dataStorageService.fetchFilterDetail(this.data.id).then(d => {
      this.filterSensors = d;
      this.makeSensorList(d);
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
}
