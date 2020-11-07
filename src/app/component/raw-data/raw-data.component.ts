import { Component, OnInit } from '@angular/core';
import { RawData } from 'src/app/model/raw-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
  styleUrls: ['./raw-data.component.css']
})
export class RawDataComponent implements OnInit {
  displayedColumns = [
    {field: 'pm10', sortable: true},
    {field: 'pm2_5', sortable: true},
    {field: 'so2', sortable: true},
    {field: 'co', sortable: true},
    {field: 'o3', sortable: true},
    {field: 'pb', sortable: true},
    {field: 'hc', sortable: true},
    {field: 'voc', sortable: true},
    {field: 'temp', sortable: true},
    {field: 'humidity', sortable: true},
    {field: 'pressure', sortable: true},
    {field: 'gps', sortable: true},
    {field: 'battery', sortable: true},
    {field: 'measured', sortable: true},
    {field: 'aqi', sortable: true}
  ];
  dataSource: RawData[] = [];
  selection = new SelectionModel(false, []);
  isLoadingResults = true;
  constructor(private dataStorageService: DataStorageService) { }

  ngOnInit(): void {
    this.dataStorageService.mapDataBus.subscribe((d: RawData[]) => {
      this.dataSource = d;
      this.isLoadingResults = false;
    });
    this.dataStorageService.loadingStatusBus.subscribe((s: boolean) =>{
      this.isLoadingResults = s;
    });
  }

  onClick(element) {
    this.selection.toggle(element)
  }
}
