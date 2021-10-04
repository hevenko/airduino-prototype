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
  //TODO when  hidden: true apears not last in the list it will messup referencing by index
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
    {sensor: 'battery', desc: 'Battery', label: 'Battery', hidden:true},
    {sensor: 'aqi', desc: 'Aqi', label: 'Aqi', hidden:true},
    {sensor: 'gps', desc: 'GPS', label: 'GPS', hidden:true},
    {sensor: 'measured', desc: 'Measured', label: 'Msrd', hidden:true}
    
  ];
  compForm: FormGroup = new FormGroup({});
  faSensors: FormArray = new FormArray([]);
  defaultLabel = 'Sensors';
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
    this.subscribeToPreseting();
  }
  fetchData = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.subscription = this.dataStorageService.fetchData(this.filterModel);
  }
  initForm() {
    
    let selectableSensors = SensorComponent.sensorList.filter(v => {return !v.hidden});
    for (const def of selectableSensors) {
      this.faSensors.push(new FormControl({value: true, disabled: false}));
    }
    this.compForm = new FormGroup({
      sensors: this.faSensors
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
    return !!label && label.length > 0  ? label : this.defaultLabel;
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
  subscribeToPreseting() {
    this.dataStorageService.presetChangedBus.subscribe(v => {
      let sensorList: string[] = v.sensors;
      SensorComponent.sensorList.filter(v => {return !v.hidden}).map((v, i) => { // assuming "hidden: true" sensors at the sensor list end
          let checked = sensorList?.indexOf(v.sensor) != -1;
          this.faSensors.controls[i].setValue(checked);
      });
    });
  }

}
