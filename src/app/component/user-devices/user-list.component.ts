import { Component, OnInit, ViewChild } from '@angular/core';
import { RemoteLoDService, IDataState, IoDataResponse } from './remote-lod.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DeviceListComponent } from './device-list/device-list.component';
import { NewDeviceComponent } from './new-device/new-device.component';
import { MatDialog } from '@angular/material/dialog';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  compounds: Compound[];
}
export interface Compound {
  name: string;
  desc: string;
}
@Component({
  selector: 'app-user-devices',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['CustomerID', 'CompanyName', 'ContactName', 'AddNewDevice'];
  dataSource = [];
  rootData: IDataState = { key: 'Customers', parentID: '', parentKey: '', rootLevel: true };
  expandedElement: any[] = [];
  rowId = 0;
  clickedUser: any;
  @ViewChild('deviceList') deviceList: DeviceListComponent;

  constructor(private remoteService: RemoteLoDService, public dialog: MatDialog) { }

  ngOnInit(): void {

    this.remoteService.getData(this.rootData).subscribe((data: IoDataResponse) => {
      if (data.equals(this.rootData)) {
        this.dataSource = data.value;
      }
    });
  }
  expandRow(element: any) {

    let ind = this.expandedElement.map((e) => { return e.CustomerID }).indexOf(element.CustomerID);
    if (ind !== -1) {
      this.expandedElement.splice(ind, 1);
    } else {
      this.expandedElement.push(element);
    }
  }
  shouldShowDetailRow(element: any): boolean {
    let rezultat = this.expandedElement.map((e) => { return e.CustomerID }).indexOf(element.CustomerID) !== -1;
    return rezultat;
  }
  consoleLog(parent: any) {
    console.log(parent);
  }
  getRowId() {
    return this.rowId++;
  }
  getChildDataState(element: any) {
    return {key: 'Orders', parentID: element.CustomerID, parentKey: 'CustomerID', rootLevel: false};

  }
  addDeviceOnClick(e: MouseEvent, clickedUser: any) {
    e.stopPropagation();
    this.clickedUser = clickedUser;
    const dialogRef = this.dialog.open(NewDeviceComponent, {data: {title: 'New device'}});

    dialogRef.afterClosed().subscribe(result => {
      if(!!result) {
        this.deviceList.fetchData();
      }
    });
  }
}
