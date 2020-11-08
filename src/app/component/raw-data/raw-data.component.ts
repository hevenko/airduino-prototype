import { Component, OnInit } from '@angular/core';
import { RawData } from 'src/app/model/raw-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { SelectionModel } from '@angular/cdk/collections';
import { CustomLoadingOverlay } from '../map/ag-grid.ts/custom-loading-overlay.component';
import { CustomNoRowsOverlay } from '../map/ag-grid.ts/custom-no-rows-overlay.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
  styleUrls: ['./raw-data.component.css']
})
export class RawDataComponent implements OnInit {
  displayedColumns = [
    {field: 'pm10', sortable: true, minWidth:110},
    {field: 'pm2_5', sortable: true, minWidth:80},
    {field: 'so2', sortable: true, minWidth:60},
    {field: 'co', sortable: true, minWidth:80},
    {field: 'o3', sortable: true, minWidth:80},
    {field: 'pb', sortable: true, minWidth:80},
    {field: 'hc', sortable: true, minWidth:80},
    {field: 'voc', sortable: true, minWidth:80},
    {field: 'temp', sortable: true, minWidth:80},
    {field: 'humidity', sortable: true, minWidth:120},
    {field: 'pressure', sortable: true, minWidth:120},
    {field: 'gps', sortable: true, minWidth:200},
    {field: 'battery', sortable: true, minWidth:120},
    {field: 'measured', sortable: true, minWidth:200, sort:'asc'},
    {field: 'aqi', sortable: true, minWidth:80}
  ];
  dataSource: RawData[] = [];// grid expects all data at once
  tempDataSource: RawData[] = [];
  
  frameworkComponents;
  loadingOverlayComponent;
  loadingOverlayComponentParams;
  noRowsOverlayComponent;
  noRowsOverlayComponentParams;
  isLoadingResults = true;
  gridApi;

  constructor(private dataStorageService: DataStorageService) { 
    this.frameworkComponents = {
      customLoadingOverlay: CustomLoadingOverlay,
      customNoRowsOverlay: CustomNoRowsOverlay,
    };
    this.loadingOverlayComponent = 'customLoadingOverlay';
    this.loadingOverlayComponentParams = {
      loadingMessage: 'Loading...',
    };
    this.noRowsOverlayComponent = 'customNoRowsOverlay';
    this.noRowsOverlayComponentParams = {
      noRowsMessageFunc: function () {
        return 'Sorry - no rows! at: ' + new Date();
      },
    };
  }

  ngOnInit(): void {
    this.dataStorageService.pageOfDataBus.subscribe((d: RawData[]) => {
      this.tempDataSource = this.tempDataSource.concat(d);
    });
    this.dataStorageService.loadingStatusBus.subscribe((s: boolean) =>{
      this.isLoadingResults = s;
      if(this.isLoadingResults) {
        this.gridApi?.showLoadingOverlay();
        this.tempDataSource = [];
      } else {
        this.dataSource = this.tempDataSource;
        this.gridApi?.hideOverlay();
      }
    });
 }
 onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    params.api.sizeColumnsToFit();
    window.addEventListener('resize', function () {
      setTimeout(function () {
        this.gridApi?.sizeColumnsToFit();
      });
    });
  
  }
}
