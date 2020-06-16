import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
  styleUrls: ['./raw-data.component.css']
})
export class RawDataComponent implements OnInit {
  displayedColumns: string[] = ['PM10', 'PM25', 'S02', 'CO', 'O3','PB','HC','VOC','TEMP','HUMIDITY','PRESSURE','GPS','BATTERY','MEASURED','AQI'];
  dataSource = [
    {'PM10':1, 'PM25':1, 'S02':1, 'CO':1, 'O3':1,'PB':1,'HC':1,'VOC':1,'TEMP':1,'HUMIDITY':16,'PRESSURE':1023,'GPS':'1121.121;1234.45','BATTERY':1,'MEASURED':1,'AQI':1}
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
