import { Component, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import { FilterModel } from 'src/app/model/filter-model';
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
    {value: 'pb', desc: 'Lead', label: 'Lead'},
    {value: 'battery', desc: 'Battery', label: 'Battery'},
    {value: 'gps', desc: 'GPS', label: 'GPS'},
    {value: 'measured', desc: 'Measured', label: 'Measured'}
    
  ];
  compForm: FormGroup = new FormGroup({});
  defaultLabel = 'Sensors (?)';
  subscription;
  fetchDataSetTimeout;
  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { }
  sensorList = SensorComponent.sensorList;
  ngOnInit(): void {
    this.initForm();
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
    for (const def of SensorComponent.sensorList) {
      faSensors.push(new FormControl({value: true, disabled: (def.value === 'gps' || def.value === 'measured')}));
    }
    this.compForm = new FormGroup({
      sensors: faSensors
    })
    this.compForm.valueChanges.subscribe(() => {
      this.filterModel.sensors = this.getComponentValue();
      clearTimeout(this.fetchDataSetTimeout);
      //this.fetchDataSetTimeout = setTimeout(this.fetchData,2000);
    });
    this.compForm.patchValue({"sensors":[true,true,true,true,true,true,true,true,true,true,true,true,true]}); //this triggers onchange, constructor does not
  }
  getSensorControls() {
    return (this.compForm.get('sensors') as FormArray).controls;
  }
  getLabel() {
    const label = (this.compForm.controls.sensors as FormArray).controls
      .map((v, i) => (v.value ? i === 0 ? SensorComponent.sensorList[i].label :  ' ' + SensorComponent.sensorList[i].label : null))
      .filter(v => v !== null);
    return !!label && label.length > 0  ? label : this.defaultLabel;
  }
  getComponentValue(): string[] {
    let result = [];
    result = (this.compForm.controls.sensors as FormArray).controls
      .map((v, i) => (v.value ? SensorComponent.sensorList[i].value :  null))
      .filter(v => v !== null);
    
      // if (!!result.length) {
      //   result = result.concat(['measured', 'gps']); //user can't choose this sensor, it is required by the app
      // }
       return !!result ? result : null;
  }
}
