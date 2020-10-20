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
  sensorList = [
    {value: 'temp', desc: 'Temperature', label: '<sup>o</sup>C'},
    {value: 'humidity', desc: 'Humidity', label: 'H%'},
    {value: 'so2', desc: 'Sulfur dioxide', label: 'SO<sub>2</sub>'},
    {value: 'o3', desc: 'Ozone', label: 'O<sub>3</sub>'}
  ];
  compForm: FormGroup = new FormGroup({});
  defaultLabel = 'Sensors (?)';

  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { }

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    const faSensors: FormArray = new FormArray([]);
    for (const def of this.sensorList) {
      faSensors.push(new FormControl(false));
    }
    this.compForm = new FormGroup({
      sensors: faSensors
    })
    this.compForm.valueChanges.subscribe(() => {
      this.filterModel.sensors = this.getComponentValue();
      this.dataStorageService.fetchData();
    });
    this.compForm.patchValue({"sensors":[true,true,true,true]});
  }
  getSensorControls() {
    return (this.compForm.get('sensors') as FormArray).controls;
  }
  getLabel() {
    const label = this.compForm.value.sensors
      .map((v, i) => (v ? i === 0 ? this.sensorList[i].label :  ' ' + this.sensorList[i].label : null))
      .filter(v => v !== null);
    return !!label && label.length > 0  ? label : this.defaultLabel;
  }
  getComponentValue(): string[] {
    let result = [];
    result = this.compForm.value.sensors
      .map((v, i) => (v ? this.sensorList[i].value :  null))
      .filter(v => v !== null);
    
    if (!!result.length) {
      result = result.concat(['measured','gps','battery']);
    }
    
    return !!result ? result : null;
  }
}
