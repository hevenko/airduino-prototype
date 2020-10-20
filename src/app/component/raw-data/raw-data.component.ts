import { Component, OnInit } from '@angular/core';
import { RawData } from 'src/app/model/raw-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
  styleUrls: ['./raw-data.component.css']
})
export class RawDataComponent implements OnInit {
  displayedColumns: string[] = ['pm10', 'pm25', 'so2', 'co', 'o3','pb','hc','voc','temp','humidity','pressure','gps','battery','measured','aqi'];
  dataSource: RawData[] = [
  ];

  constructor(private dataStorageService: DataStorageService) { }

  ngOnInit(): void {
    this.dataStorageService.dataBus.subscribe((d: RawData[]) => {
      this.dataSource = d;
    });
  }

}
