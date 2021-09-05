import { Component, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import { exit } from 'process';
import { FilterModel } from 'src/app/model/filter-model';
import { Constants } from 'src/app/shared/constants';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {
  static sensorList = [
    {sensor: 'temp', desc: 'Temperature', label: '<sup>o</sup>C'},
    {sensor: 'humidity', desc: 'Humidity', label: 'H%'},
    {sensor: 'so2', desc: 'Sulfur dioxide', label: 'SO<sub>2</sub>'},
    {sensor: 'o3', desc: 'Ozone', label: 'O<sub>3</sub>'},
    {sensor: 'hc', desc: 'hc', label: 'Hc'},
    {sensor: 'voc', desc: 'voc', label: 'Voc'},
    {sensor: 'pressure', desc: 'Pressure', label: 'Pa'},
    {sensor: 'co', desc: 'Carbon monoxyde', label: 'CO'},
    {sensor: 'pm10', desc: 'Pm10', label: 'pm10'},
    {sensor: 'pm2_5', desc: 'Pm2.5', label: 'pm2.5'},
    {sensor: 'pb', desc: 'Lead', label: 'Pb'},
    {sensor: 'battery', desc: 'Battery', label: 'Battery'},
    {sensor: 'aqi', desc: 'Aqi', label: 'Aqi'},
    {sensor: 'gps', desc: 'GPS', label: 'GPS', hidden:true},
    {sensor: 'measured', desc: 'Measured', label: 'Msrd', hidden:true}
    
  ];
  compForm: FormGroup = new FormGroup({});
  defaultLabel = '';
  subscription;
  fetchDataSetTimeout;
  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { }
  sensorList;// = SensorComponent.sensorList;
  loadedSensors = []; //data are loaded for these sensors
  static label: string | string[];
  bMissingDataForSensor = false; //gets sensor data if false

  ngOnInit(): void {
    this.sensorList = SensorComponent.sensorList.filter(s => {return !s.hidden});
    SensorComponent.label = this.defaultLabel;
    this.filterModel.sensorFilterChangedBus.next(null); //to show default label on filter-info component

    this.initForm();
    this.dataStorageService.loadingStatusBus.subscribe((v: boolean) => {
      if(v != null && !v) {
        this.loadedSensors = this.getComponentValue();
        this.bMissingDataForSensor = false;
      }
    });
    this.dataStorageService.usubscribeBroadcastBus.subscribe(v => { //prevents drawing feaures (dots) outside poligon
      this.subscription?.unsubscribe();
    });
    this.dataStorageService.allMenusClosedBus.subscribe(b => {
      if(Constants.SENSOR_MENU_LAST_CLOSED === b) {
        if(this.bMissingDataForSensor) {
          this.fetchData();
        }
       }
    });
  }
  fetchData = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.subscription = this.dataStorageService.fetchData(this.filterModel);
  }
  initForm() {
    const faSensors: FormArray = new FormArray([]);
    let selectableSensors = SensorComponent.sensorList.filter(v => {return !v.hidden});
    for (const def of selectableSensors) {
      faSensors.push(new FormControl({value: true, disabled: false}));
    }
    this.compForm = new FormGroup({
      sensors: faSensors
    })
    this.compForm.valueChanges.subscribe(() => {
      let checkedSensors = this.getComponentValue();
      SensorComponent.label = this.makeLabel();
      this.filterModel.sensors = checkedSensors; //triggers next on BehSubject
      checkedSensors.forEach(s => {
        if(this.loadedSensors.indexOf(s) == -1) {
          this.bMissingDataForSensor = true;
          return;
        }
      });
    });
    this.compForm.patchValue({"sensors":[true,true,true,true,true,true,true,true,true,true,true,true,true]}); //this triggers onchange, constructor does not
  }
  getSensorControls() {
    return (this.compForm.get('sensors') as FormArray).controls;
  }
  makeLabel(): string | string[] {
    const label = (this.compForm.controls.sensors as FormArray).controls
      .map((v, i) => (v.value ? i === 0 ? SensorComponent.sensorList[i].label :  ' ' + SensorComponent.sensorList[i].label : null))
      .filter(v => v !== null);
    return !!label && label.length > 0  ? label : '';
  }
  getComponentValue(): string[] {
    let result = [];
    result = (this.compForm.controls.sensors as FormArray).controls
      .map((v, i) => (v.value ? SensorComponent.sensorList[i].sensor :  null))
      .filter(v => v !== null);
    
      if (!!result.length) {
        result = result.concat(['measured','gps']); //user can't choose this sensor, it is required by the app
      }
       return !!result ? result : null;
  }
}
