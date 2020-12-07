import { Component, OnDestroy, OnInit } from '@angular/core';
import { Owner } from 'src/app/model/owner';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { Device } from 'src/app/model/device';
import { FilterModel } from 'src/app/model/filter-model';
import { subscribeOn } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CheckRowRendererComponent } from '../check-row-renderer/check-row-renderer.component';
import { AirduinoComponent } from '../airduino/airduino.component';
import { MatDialog } from '@angular/material/dialog';
import { NewDeviceComponent } from './new-device/new-device.component';
import { NewUserComponent } from '../new-user/new-user.component';
import { AddUserComponent } from './add-user/add-user.component';

@Component({
  selector: 'app-user-devices',
  templateUrl: './user-devices.component.html',
  styleUrls: ['./user-devices.component.css']
})
export class UserDevicesComponent extends AirduinoComponent implements OnInit, OnDestroy {
  //grid users
  gridUsersApi;
  userHeaders = {
    mark: "mark",
    id: "id",
    name: "name",
    email: "email",
    created: "created"
  };
  gridUsersColumnDef = [
    { field: 'rowChecked', maxWidth: 100,
      cellRenderer: 'checkRowRenderer'
    },
    { field: 'id', minWidth: 80},
    { field: 'name', minWidth: 100 },
    { field: 'email', minWidth: 120 },
    { field: 'created', minWidth: 210 }
  ];
  gridUsersDefaultColDef = { resizable: true, filter: true, sortable: true };
  dsUsers = []; // grid expects all data at once
  //grid devices
  gridDevicesApi;
  deviceHeaders = {
    id: "id",
    type: "type",
    owner: "owner",
    firmware: "firmware",
    ffirmware: "ffirmware",
    configuration: "configuration",
    fconfiguration: "fconfiguration",
    apikey: "apikey",
    note: "note",
    enabled: "enabled",
  };
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
  gridDeviceDefaultColDef = { resizable: true, flex: 1 };
  dsDevices = []; // grid expects all data at once
  //grid sensors
  gridSensorsApi;
  sensorHeaders = {
    pm10: "PM 10",
    pm2_5: "PM 2.5",
    so2: "SO2",
    co: "CO",
    o3: "O3",
    pb: "PB",
    hc: "HC",
    voc: "VOC",
    temp: "Temp",
    humidity: "Humidity",
    pressure: "Pressure",
    gps: "GPS",
    battery: "Battery",
    measured: "Measured",
    aqi: "AQI",
  };
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

  gridSensorsDefaultColDef = { resizable: true, flex: 1 };
  dsSensors = []; // grid expects all data at once


  subcriptions: Subscription[] = [];

  constructor(private dataStorageService: DataStorageService, private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    console.log('init: UserDevicesComponent');
    // load user headers;
    this.gridUsersColumnDef.forEach((column: any) => column.headerName = this.userHeaders[column.field]);

    // load device headers
    this.gridDeviceColumnDefs.forEach((column: any) => column.headerName = this.deviceHeaders[column.field]);

    // load sensor headers
    this.gridSensorsColumnDefs.forEach((column: any) => column.headerName = this.sensorHeaders[column.field]);
    //grid devices
    this.dataStorageService.userDevicesBus.subscribe(d => {
      this.dsDevices = d;
    });
    //grid sensors
    this.dataStorageService.deviceSensorsBus.subscribe(d => {
      this.dsSensors = d;
    });
    //new user
    this.dataStorageService.newUserBus.subscribe(u => {
      this.dsUsers = this.dsUsers.concat([u]);
    });
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
    let s = this.dataStorageService.fetchDevices(selectedId);
  }
  userGridFrameworkComponents = {
    checkRowRenderer: CheckRowRendererComponent
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
    let s = this.dataStorageService.fetchSensors(filter);
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
  btnDeleteUserOnClick(e: any) {
    this.showConfirmationDialog(this.dialog, "Delete row?");
  }
  btnAddDeviceOnClick(e: any) {
    this.showDialog(this.dialog, null, null, NewDeviceComponent, 'New user', null, null);
  }
  btnAddUserOnClick(e: any) {
    let afterClose = r => {console.log(r)};
    //this.dialog.open(AddUserComponent, {data: {title: 'New user'}});
    this.showDialog(this.dialog, '', '', AddUserComponent, 'New user', null, afterClose);
  }
}
