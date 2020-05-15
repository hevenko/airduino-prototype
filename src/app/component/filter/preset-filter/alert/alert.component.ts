import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

}
