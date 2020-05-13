import { Component, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {
  values = [
    {value: '1', desc: 'Temperature', label: '<sup>o</sup>C'},
    {value: '2', desc: 'Humidity', label: 'H%'},
    {value: '1', desc: 'Sulfur dioxide', label: 'SO<sub>2</sub>'},
    {value: '2', desc: 'Ozone', label: 'O<sub>3</sub>'}
  ];
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
      .map((v, i) => (v ? i === 0 ? this.values[i].label :  ' ' + this.values[i].label : null))
      .filter(v => v !== null);
    return !!label && label.length > 0  ? label : 'Sensors';
  }
}
