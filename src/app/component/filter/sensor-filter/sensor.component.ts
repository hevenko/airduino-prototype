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
    {value: 'temp', desc: 'Temperature', label: '<sup>o</sup>C'},
    {value: 'humidity', desc: 'Humidity', label: 'H%'},
    {value: 'so2', desc: 'Sulfur dioxide', label: 'SO<sub>2</sub>'},
    {value: 'o3', desc: 'Ozone', label: 'O<sub>3</sub>'},
    {value: 'hc', desc: 'hc', label: 'Hc'},
    {value: 'voc', desc: 'voc', label: 'Voc'},
    {value: 'pressure', desc: 'Pressure', label: 'Pa'},
    {value: 'co', desc: 'Carbon monoxyde', label: 'CO'},
    {value: 'pm10', desc: 'Pm10', label: 'pm10'},
    {value: 'pm2_5', desc: 'Pm2.5', label: 'pm2.5'},
    {value: 'pb', desc: 'Lead', label: 'Pb'},
    {value: 'battery', desc: 'Battery', label: 'Battery'},
    {value: 'aqi', desc: 'Aqi', label: 'Aqi'},
    {value: 'gps', desc: 'GPS', label: 'GPS'}
    
  ];
  compForm: FormGroup = new FormGroup({});
  defaultLabel = '';
  subscription;
  fetchDataSetTimeout;
  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { }
  sensorList = SensorComponent.sensorList;
  loadedSensors = []; //data are loaded for these sensors
  static label: string | string[];
  bMissingDataForSensor = false; //gets sensor data if false

  ngOnInit(): void {
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
    let selectableSensors = SensorComponent.sensorList.filter(v => {return v.value != 'measured' && v.value != 'gps'});
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
      .map((v, i) => (v.value ? SensorComponent.sensorList[i].value :  null))
      .filter(v => v !== null);
    
      if (!!result.length) {
        result = result.concat(['measured','gps']); //user can't choose this sensor, it is required by the app
      }
       return !!result ? result : null;
  }
}
