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
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';
import { DatePipe, formatDate } from '@angular/common';
import { CheckboxRequiredValidator } from '@angular/forms';

@Component({
  selector: 'app-user-devices',
  templateUrl: './user-devices.component.html',
  styleUrls: ['./user-devices.component.css']
})
export class UserDevicesComponent extends AirduinoComponent implements OnInit, OnDestroy {
  showBlockedUsers = false;
  showBlockedDevices = false;
  showUsersGrid = false;
  //grid users
  gridUsersApi;
  userHeaders = {
    rowChecked: "",
    id: "id",
    name: "name",
    email: "email",
    created: "created",
    enabled: "enabled",
    groupowner: "groupowner",
    admin: "admin"
  };
  gridUsersColumnDef;
  gridUsersDefaultColDef = { resizable: true, flex: 1, filter: true, sortable: true };
  dsUsers = []; // grid expects all data at once
  //grid devices
  gridDevicesApi;
  deviceHeaders = {
    rowChecked: "",
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
  gridDeviceDefaultColDef = { resizable: true, flex: 1, filter: true, sortable: true };
  dsDevices = []; // grid expects all data at once
  dsSensors:any = {};


  subcriptions: Subscription[] = [];

  disableAddDevices = true;
  disabled;
  deviceTypeList = [];
  firmwaresList = [];
  configurationsList = [];

  constructor(private dataStorageService: DataStorageService, private dialog: MatDialog, private messageService: MessageService,
    private auth: AuthService) 
  {
    super();
    
  }

  async ngOnInit() {
    // waiting for codebooks to load, otherwise colums are empty
    this.deviceTypeList = await this.dataStorageService.fetchDeviceTypes(); //await needs parent method to be async
    this.firmwaresList = await this.dataStorageService.fetchFirmwares();
    this.configurationsList = await this.dataStorageService.fetchConfigurations();

    this.gridDeviceColumnDefs = [
      { field: 'rowChecked', cellRenderer: 'checkRowRenderer', headerName: "Check", maxWidth: 100},
      { field: 'id', headerName: "id", minWidth: 110},
      { field: 'type', headerName: "type", minWidth: 110, valueGetter: this.getDeviceType },
      { field: 'owner', headerName: "owner", minWidth: 110 },
      { field: 'firmware', headerName: "firmware", minWidth: 110, valueGetter: this.getFirmware },
      { field: 'ffirmware', headerName: "ffirmware", minWidth: 110 },
      { field: 'configuration', headerName: "configuration", minWidth: 110, valueGetter: this.getConfiguration },
      { field: 'fconfiguration', headerName: "fconfiguration", minWidth: 110 },
      { field: 'apikey', headerName: "apikey", minWidth: 110 },
      { field: 'note', headerName: "note", minWidth: 110 },
      { field: 'enabled', headerName: "enabled", minWidth: 110, cellRenderer: this.booleanCellRenderer}
    ];
    this.gridUsersColumnDef = [
      { field: 'rowChecked', maxWidth: 100,
        cellRenderer: 'checkRowRenderer', headerName: 'Check'
      },
      { field: 'id', minWidth: 80},
      { field: 'name', minWidth: 100 },
      { field: 'email', minWidth: 120 },
      { field: 'created', minWidth: 210, valueFormatter: this.formatCreatedColumn },
      { field: 'enabled', minWidth: 50, cellRenderer: this.booleanCellRenderer },
      { field: 'groupowner', minWidth: 50, cellRenderer: this.booleanCellRenderer},
      { field: 'admin', minWidth: 50, cellRenderer: this.booleanCellRenderer}
    ];
    //geting devices for non admin user
    this.auth.loginBus.subscribe((user: User) => {
      if(user) {
        this.showUsersGrid = user.admin;
        if(!this.showUsersGrid) {
          this.dataStorageService.fetchOwners().subscribe((data: Owner[]) => {
            this.dsUsers = data;
            this.dsUsers.forEach((v:any) => {
              if(v.email === user?.email) {
                this.dataStorageService.fetchDevices(v.id);
              }
            })
          });  
        }  
      }
    })
    // this.dataStorageService.fetchDeviceTypes()?.then(v => {
    //   this.deviceTypeList = v;
    // });
    console.log('init: UserDevicesComponent');
    // load user headers;
    this.gridUsersColumnDef.forEach((column: any) => column.headerName = this.userHeaders[column.field]);

    // load device headers
    this.gridDeviceColumnDefs.forEach((column: any) => column.headerName = this.deviceHeaders[column.field]);

    //grid devices
    this.dataStorageService.userDevicesBus.subscribe(d => {
      this.dsDevices = d;
    });
    //grid sensors
    this.dataStorageService.deviceSensorsBus.subscribe(d => {
      this.dsSensors = d ? d[0] : {};
    });

    //new user
    this.dataStorageService.newUserBus.subscribe(u => {
      if(!u || u.length == 0) return;
      let addObject = this.gridUsersApi?.applyTransaction({add: [u]});
      let newNode = addObject?.add[0];
      newNode?.setSelected(true);
      this.gridUsersApi?.ensureNodeVisible(newNode, 'middle');
    });
    //edit user
    this.dataStorageService.editUserBus.subscribe((ids: any[]) => {
      if(!ids || ids.length == 0) return;
      let addObject = this.gridUsersApi?.applyTransaction({update: ids});
    });
    //new device
    this.dataStorageService.newDeviceBus.subscribe(u => {
      if(!u || u.length == 0) return;
      let addObject = this.gridDevicesApi?.applyTransaction({add: [u]});
      let newNode = addObject?.add[0];
      newNode?.setSelected(true);
      this.gridDevicesApi?.ensureNodeVisible(newNode, 'middle');
    });
    //edit device
    this.dataStorageService.editDeviceBus.subscribe((u: any[]) => {
      if(!u || u.length == 0) return;
      this.gridDevicesApi?.applyTransaction({update : u});
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
        if(!enableUser) {
          this.gridUsersApi.deselectAll();
          this.dataStorageService.userDevicesBus.next([]);
        }
      });
    } else {
      this.messageService.showMessage(Constants.MSG_CHECK_SOME_ROWS, MessageColor.Yellow);
    }
  }
  onGridUsersSortChanged(e: any /*AgGridEvent*/) {
    e.api.refreshCells();
  }
  onGridUsersSelectionChanged(e: any) {
    let selectedId = null;
    this.disableAddDevices = true;
    let selRow = e.api.getSelectedRows()[0];
    if(selRow) {
      this.disableAddDevices = !selRow.groupowner;
      selectedId = selRow.id;      
    }
    //grid data
    let s = this.dataStorageService.fetchDevices(selectedId);
  }
  onGridUsersCellDoubleClicked(e: any) {
    this.btnEditUserOnCLick(e);
  }
  devicesGridCellDoubleClicked(e: any) {
    this.btnEditDevicOnCLick(e);
  }
  userGridFrameworkComponents = {
    checkRowRenderer: CheckRowRendererComponent
  }
  showBlockedUsersOnChange(e: any) {
    if(!this.showBlockedUsers) {
      this.gridUsersApi.deselectAllFiltered();
    }
    this.gridUsersApi.onFilterChanged();
  }
  userGridHasFilter = (): boolean => {
    return !this.showBlockedUsers;
  }
  userGridFilterDisabledUser(rowNode: RowNode): boolean {
    if(!this.showBlockedUsers && !rowNode.data.enabled) { //clearing checked mark for hidden rows
      rowNode.data.rowChecked = false;
    }
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
  }
  gridDevicesGetRowNodeId = (d: any) => {
    return d.id;
  }
  devicesGridFrameworkComponents = {
    checkRowRenderer: CheckRowRendererComponent
  }
  showBlockedDevicesOnChange(e: any) {
    this.gridDevicesApi.onFilterChanged();
  }
  devicesGridHasFilter = (): boolean => {
    return !this.showBlockedDevices;
  }
  devicesGridFilterDisabledDevice(rowNode: RowNode): boolean {
    return rowNode.data.enabled
  }
  setDevicesEnabled(enableUser: boolean) {
    let isCheckedRows = false;
    this.gridDevicesApi.forEachNodeAfterFilterAndSort((node: RowNode, index: any) => {
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
          this.gridDevicesApi.forEachNodeAfterFilterAndSort((node: RowNode, index: any) => {
            if(node.data.rowChecked) {
              list.push(node);
            }
            console.log(node);
          });
          this.dataStorageService.setDevicesEnabled(list, enableUser); // setting enabled/disabled to each row
        }
      });  
    } else {
      this.messageService.showMessage(Constants.MSG_CHECK_SOME_ROWS, MessageColor.Yellow);
    }
  }

  btnAddDeviceOnClick(e: any) {
    let r = this.gridUsersApi.getSelectedNodes();
    if (r.length === 1) {
      let formData: any = {};
      formData.ownerName = r[0].data.name;
      formData.ownerId = r[0].data.id;
        this.showDialog(this.dialog, null, null, NewDeviceComponent, Constants.TITLE_NEW_DEVICE, formData, null);
    } else if (r.length > 1) {
      this.messageService.showMessage(Constants.MSG_SELECT_ONE_ROW, MessageColor.Yellow);
    } else {
      this.messageService.showMessage(Constants.MSG_SELECT_ROW, MessageColor.Yellow);
    }
  }
  btnEditDevicOnCLick(e:any) {
    let selDevices = this.gridDevicesApi.getSelectedNodes();
    let selUsers = this.gridUsersApi.getSelectedNodes();
    if (selDevices.length === 1 && selUsers.length === 1) {
      let formData: any = {};
      formData.ownerName = selUsers[0].data.name;
      formData.ownerid = selUsers[0].data.id;
      formData.deviceId = selDevices[0].data.id;
      formData.devicetype = selDevices[0].data.type;
      formData.firmware = selDevices[0].data.firmware;
      formData.config = selDevices[0].data.configuration;
      formData.apikey = selDevices[0].data.apikey;
      formData.public = selDevices[0].data.public;
      formData.note = selDevices[0].data.note;
      this.showDialog(this.dialog, '', '', NewDeviceComponent,  Constants.TITLE_EDIT_DEVICE, formData, null);
    } else if (selDevices.length > 1) {
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
  formatCreatedColumn(param: any) {
    return new DatePipe('en_US').transform(param.value,"dd.MM.yyyy, hh:mm:ss");
  }
  booleanCellRenderer(params: any): any {
    let div = document.createElement('div');
    div.style.cssText ="display:flex;align-items:center;height:100%";
    let cbox = document.createElement('input');
    cbox.type = 'checkbox';
    cbox.checked = params.value;
    cbox.onclick = () => {return false;};
    cbox.style.padding = "0px";
    cbox.style.margin = "0px";
    div.appendChild(cbox);
    return div;
  }
}
