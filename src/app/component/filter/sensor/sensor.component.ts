import { Component, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {
  values = [{value: '1', desc: 'Temperature'},{value: '2', desc: 'Humidity'}];
  compForm: FormGroup = new FormGroup({});
  
  constructor() { }

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    const faSensors: FormArray = new FormArray([]);
    for (const def of this.values) {
      faSensors.push(new FormControl(false));
    }
    this.compForm = new FormGroup({
      sensors: faSensors
    })
  }
  getSensorControls(){
    return (this.compForm.get('sensors') as FormArray).controls;
  }
  getLabel() {
    const label = this.compForm.value.sensors
      .map((v, i) => (v ? this.values[i].desc : null))
      .filter(v => v !== null);
    return !!label && label.length > 0  ? label : 'sensors';
  }
}
