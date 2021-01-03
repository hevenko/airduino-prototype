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
import { RowNode } from 'ag-grid-community';
import { exit } from 'process';
import { MessageColor, MessageService } from 'src/app/shared/service/message.service';
import { Constants } from 'src/app/shared/constants';
import { AddDevicesComponent } from './add-devices/add-devices.component';

@Component({
  selector: 'app-user-devices',
  templateUrl: './user-devices.component.html',
  styleUrls: ['./user-devices.component.css']
})
export class UserDevicesComponent extends AirduinoComponent implements OnInit, OnDestroy {
  showBlockedUsers = false;
  //grid users
  gridUsersApi;
  userHeaders = {
    mark: "mark",
    id: "id",
    name: "name",
    email: "email",
    created: "created",
    enabled: "enabled",
    groupowner: "groupowner"
  };
  gridUsersColumnDef = [
    { field: 'rowChecked', maxWidth: 100,
      cellRenderer: 'checkRowRenderer'
    },
    { field: 'id', minWidth: 80},
    { field: 'name', minWidth: 100 },
    { field: 'email', minWidth: 120 },
    { field: 'created', minWidth: 210 },
    { field: 'enabled', minWidth: 50 },
    { field: 'groupowner', minWidth: 50}
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
  gridDeviceColumnDefs;
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

  disableAddDevices = true;
  disabled;
  deviceTypeList = [];
  firmwaresList = [];
  configurationsList = [];

  constructor(private dataStorageService: DataStorageService, private dialog: MatDialog, private messageService: MessageService) {
    super();
    
  }

  async ngOnInit() {
    // waiting for codebooks to load, otherwise colums are empty
    this.deviceTypeList = await this.dataStorageService.fetchDeviceTypes(); //await needs parent method to be async
    this.firmwaresList = await this.dataStorageService.fetchFirmwares();
    this.configurationsList = await this.dataStorageService.fetchConfigurations();

    this.gridDeviceColumnDefs = [
      { field: 'id', headerName: "id", minWidth: 110},
      { field: 'type', headerName: "type", minWidth: 110, valueGetter: this.getDeviceType },
      { field: 'owner', headerName: "owner", minWidth: 110 },
      { field: 'firmware', headerName: "firmware", minWidth: 110, valueGetter: this.getFirmware },
      { field: 'ffirmware', headerName: "ffirmware", minWidth: 110 },
      { field: 'configuration', headerName: "configuration", minWidth: 110, valueGetter: this.getConfiguration },
      { field: 'fconfiguration', headerName: "fconfiguration", minWidth: 110 },
      { field: 'apikey', headerName: "apikey", minWidth: 110 },
      { field: 'note', headerName: "note", minWidth: 110 },
      { field: 'enabled', headerName: "enabled", minWidth: 110}
    ];
    // this.dataStorageService.fetchDeviceTypes()?.then(v => {
    //   this.deviceTypeList = v;
    // });
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
      if(!u || u.length == 0) return;
      let addObject = this.gridUsersApi?.applyTransaction({add: [u]});
      let newNode = addObject?.add[0];
      newNode?.setSelected(true);
      this.gridUsersApi?.ensureNodeVisible(newNode, 'middle');
    });
    //delete user
    this.dataStorageService.deleteUsersBus.subscribe((ids: any[]) => {
      if(!ids || ids.length == 0) return;
      let addObject = this.gridUsersApi?.applyTransaction({update: ids});
    });
    //edit user
    this.dataStorageService.editUserBus.subscribe((u: any) => {
      if(!u || u.length == 0) return;
      this.gridUsersApi?.applyTransaction({update : [u.data]});
    });
    //new device
    this.dataStorageService.newDeviceBus.subscribe(u => {
      if(!u || u.length == 0) return;
      let addObject = this.gridDevicesApi?.applyTransaction({add: [u]});
      let newNode = addObject?.add[0];
      newNode?.setSelected(true);
      this.gridDevicesApi?.ensureNodeVisible(newNode, 'middle');
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
    //disable
    let selRow = e.api.getSelectedRows()[0];
    this.disableAddDevices = !selRow.groupowner;
    
    //grid data
    let selectedId = selRow.id;
    let s = this.dataStorageService.fetchDevices(selectedId);
  }
  onGridUsersCellDoubleClicked(e: any) {
    this.btnEditUserOnCLick(e);
  }
  userGridFrameworkComponents = {
    checkRowRenderer: CheckRowRendererComponent
  }
  showBlockedUsersOnChange(e: any) {
    this.gridUsersApi.onFilterChanged();
  }
  userGridHasFilter = (): boolean => {
    return !this.showBlockedUsers;
  }
  userGridFilterDisabledUser(rowNode: RowNode): boolean {
    return rowNode.data.enabled
  }
  gridUsersGetRowNodeId = (d: any) => {
    return d.id;
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
  }var 
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
  setUsersEnabled(enableUser: boolean) {
    let isCheckedRows = false;
    this.gridUsersApi.forEachNodeAfterFilterAndSort((node: RowNode, index: any) => {
      if(node.data.rowChecked) {
        isCheckedRows = true;
        exit;
      }
    });
    if(isCheckedRows) {
      let d = this.showConfirmationDialog(this.dialog, Constants.MSG_ARE_U_SHURE);
      d.afterClosed().subscribe(d => {
        if (d) {
          let list = [];
          this.gridUsersApi.forEachNodeAfterFilterAndSort((node: RowNode, index: any) => {
            if(node.data.rowChecked) {
              list.push(node);
            }
            console.log(node);
          });
          this.dataStorageService.setUsersEnabled(list, enableUser); // setting enabled/disabled to each row
        }
      });  
    } else {
      this.messageService.showMessage(Constants.MSG_CHECK_SOME_ROWS, MessageColor.Yellow);
    }
  }
  btnAddDeviceOnClick(e: any) {
    let r = this.gridUsersApi.getSelectedNodes();
    if (r.length === 1) {
      this.showDialog(this.dialog, null, null, NewDeviceComponent, Constants.TITLE_NEW_DEVICE, r[0], null);
    } else if (r.length > 1) {
      this.messageService.showMessage(Constants.MSG_SELECT_ONE_ROW, MessageColor.Yellow);
    } else {
      this.messageService.showMessage(Constants.MSG_SELECT_ROW, MessageColor.Yellow);
    }
  }
  btnAddUserOnClick(e: any) {
    let afterClose = r => {console.log(r)};
    //this.dialog.open(AddUserComponent, {data: {title: 'New user'}});
    this.showDialog(this.dialog, '', '', AddUserComponent,  Constants.TITLE_NEW_USER, null, afterClose);
  }
  btnEditUserOnCLick(e:any) {
    let r = this.gridUsersApi.getSelectedNodes();
    if (r.length === 1) {
      this.showDialog(this.dialog, '', '', AddUserComponent,  Constants.TITLE_EDIT_USER, r[0], null);
    } else if (r.length > 1) {
      this.messageService.showMessage(Constants.MSG_SELECT_ONE_ROW, MessageColor.Yellow);
    } else {
      this.messageService.showMessage(Constants.MSG_SELECT_ROW, MessageColor.Yellow);
    }
  }
  btnAddDevicesOnClick(e: any) {
    let selRow = this.gridUsersApi.getSelectedRows()[0];
    if(!selRow) {
      this.messageService.showMessage(Constants.MSG_SELECT_ROW, MessageColor.Yellow);
      return;
    }
    if(!selRow.groupowner) {
      this.messageService.showMessage(Constants.MSG_NOT_A_GROUPOWNER, MessageColor.Yellow);
      return;
    }
    let groupOwnerId = selRow.id;
    let afterClose = r => {console.log(r)};
    this.showDialog(this.dialog, '', '', AddDevicesComponent,  Constants.TITLE_ADD_DEVICES, {groupOwnerId: groupOwnerId}, afterClose);
  }
  getDeviceType = (param: any): string => {
    let result = this.deviceTypeList?.filter(v => {
      return v.id === param.data.type;
    });
    return result ? result[0]?.name : '?';
  }
  getFirmware = (param: any): string => {
    let result = this.firmwaresList?.filter(v => {
      return v.id === param.data.firmware;
    });
    return result ? result[0]?.name : '?';
  }
  getConfiguration = (param: any): string => {
    let result = this.configurationsList?.filter(v => {
      return v.id === param.data.configuration;
    });
    return result ? result[0]?.name : '?';
  }
}
