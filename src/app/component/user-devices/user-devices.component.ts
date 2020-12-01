import { Component, OnDestroy, OnInit } from '@angular/core';
import { Owner } from 'src/app/model/owner';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import 'ag-grid-enterprise';
import { Device } from 'src/app/model/device';
import { FilterModel } from 'src/app/model/filter-model';
import { subscribeOn } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-devices',
  templateUrl: './user-devices.component.html',
  styleUrls: ['./user-devices.component.css']
})
export class UserDevicesComponent implements OnInit, OnDestroy {
  addDeviceCell = (p) => {
    return '<div syle="padding: 5px"><button type="text" class="btn-default">Add device</button></div>'
  }
  //grid users
  gridUsersApi;
  gridUsersColumnDef = [
    { field: 'id', headerName: "id", minWidth: 80},
    { field: 'name', headerName: "name", minWidth: 100 },
    { field: 'email', headerName: "email", minWidth: 120 },
    { field: 'created', headerName: "created", minWidth: 210 },
    { field: 'Add', headerName: "Add device", minWidth: 50, cellRenderer: this.addDeviceCell }
  ];
  gridUsersDefaultColDef = { resizable: true, filter: true, sortable: true };
  dsUsers = []; // grid expects all data at once
  //grid devices
  gridDevicesApi;
  gridDeviceColumnDefs = [
    { field: 'id', headerName: "id", minWidth: 110},
    { field: 'type', headerName: "type", minWidth: 110 },
    { field: 'owner', headerName: "owner", minWidth: 110 },
    { field: 'firmware', headerName: "firmware", minWidth: 110 },
    { field: 'ffirmware', headerName: "ffirmware", minWidth: 110 },
    { field: 'configuration', headerName: "configuration", minWidth: 110 },
    { field: 'fconfiguration', headerName: "fconfiguration", minWidth: 110 },
    { field: 'apikey', headerName: "apikey", minWidth: 110 },
    { field: 'note', headerName: "note", minWidth: 110 },
    { field: 'enabled', headerName: "enabled", minWidth: 110}
  ];
  gridDeviceDefaultColDef = { flex: 1 };
  dsDevices = []; // grid expects all data at once
  //grid sensors
  gridSensorsApi;
  gridSensorsColumnDefs = [
    { field: 'pm10', headerName: "PM 10", minWidth: 110 },
    { field: 'pm2_5', headerName: "PM 2.5", minWidth: 100 },
    { field: 'so2', headerName: "SO2", minWidth: 60 },
    { field: 'co', headerName: "CO", minWidth: 80 },
    { field: 'o3', headerName: "O3", minWidth: 80 },
    { field: 'pb', headerName: "PB", minWidth: 80 },
    { field: 'hc', headerName: "HC", minWidth: 80 },
    { field: 'voc', headerName: "VOC", minWidth: 80 },
    { field: 'temp', headerName: "Temp", minWidth: 100 },
    { field: 'humidity', headerName: "Humidity", minWidth: 120 },
    { field: 'pressure', headerName: "Pressure", minWidth: 120 },
    { field: 'gps', headerName: "GPS", minWidth: 200 },
    { field: 'battery', headerName: "Battery", minWidth: 120 },
    { field: 'measured', headerName: "Measured", minWidth: 210, sort:'asc' },
    { field: 'aqi', headerName: "AQI", minWidth: 80 }     
  ];

  gridSensorsDefaultColDef = { flex: 1 };
  dsSensors = []; // grid expects all data at once

  
  subcriptions: Subscription[] = [];

  constructor(private dataStorageService: DataStorageService) { }

  ngOnInit(): void {
    console.log('init: UserDevicesComponent')
  }
  ngOnDestroy(): void {
    this.subcriptions.forEach(v => {
      v.unsubscribe();
    });
  }
  //grid users
  onGridUsersReady(params) {
    this.gridUsersApi = params.api;
    params.api.sizeColumnsToFit();

    window.addEventListener('resize', function () {
      setTimeout(function () {
        this.gridApi?.sizeColumnsToFit();
      });
    });
    this.dataStorageService.fetchOwners().subscribe((data: Owner[]) => {
      this.dsUsers = data;
    });
  }
  onGridUsersSortChanged(e: any /*AgGridEvent*/) {
    e.api.refreshCells();
  }
  onGridUsersSelectionChanged(e: any) {
    let selectedId = e.api.getSelectedRows()[0].id;
    let s = this.dataStorageService.fetchDevices(selectedId).subscribe( d => {
      this.dsDevices = d;
      s.unsubscribe();
    });
  }
  //grid devices
  onGridDevicesReady(params) {
    this.gridDevicesApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onGridDevicesSelectionChanged(e: any) {
    let filter = new FilterModel();
    filter.setLocations({devices : [e.api.getSelectedRows()[0].id]});
    filter.sensors = ["temp","humidity","so2","o3","hc","voc","pressure","co","pm10","pm2_5","pb","measured","gps","battery"];
    filter.time = {from: {date : new Date(2020, 1, 1)}};
    filter.order = ["-measured"];
    filter.limit = 1;
    let s = this.dataStorageService.fetchSensors(filter).subscribe( d => {
      this.dsSensors = d;
      s.unsubscribe();
    });
  }
  onGridDevicesSortChanged(e: any /*AgGridEvent*/) {
    e.api.refreshCells();
  }
  //grid sensors
  onGridSensorsReady(params) {
    this.gridSensorsApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onGridSensorsSortChanged(e: any /*AgGridEvent*/) {
    e.api.refreshCells();
  }
  onGridSensorsSelectionChanged(e: any) {
    let selectedRows = this.gridSensorsApi.getSelectedRows();
    selectedRows.forEach(element => {
    });
  }
}
