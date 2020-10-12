import { Component, OnInit, Input } from '@angular/core';
import { RemoteLoDService, IDataState, IoDataResponse, DataResponse } from '../remote-lod.service';
import { Observable } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { NewDeviceComponent } from '../new-device/new-device.component';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]

})
export class DeviceListComponent implements OnInit {
  displayedColumns: string[] = ['OrderID', 'CustomerID', 'DeleteDevice'];
  dataSource = [];
  expandedElement: any[] = [];
  rowId = 0;
  @Input() dataState: IDataState; // = { key: 'Orders', parentID: 'ALFKI', parentKey: 'CustomerID', rootLevel: false };

  constructor(private remoteService: RemoteLoDService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchData();
  }
  fetchData(): void {
    let r = this.remoteService.getData(this.dataState).subscribe((data: IoDataResponse) => {
      if (data.equals(this.dataState))
      this.dataSource = data.value;
    });

  }
  expandRow(element: any) {

    let ind = this.expandedElement.map((e) => { return e.OrderID }).indexOf(element.OrderID);
    if (ind !== -1) {
      this.expandedElement.splice(ind, 1);
    } else {
      this.expandedElement.push(element);
    }
  }
  shouldShowDetailRow(element: any): boolean {
    let rezultat = this.expandedElement.map((e) => { return e.OrderID }).indexOf(element.OrderID) !== -1;
    return rezultat;
  }
  consoleLog(parent: any) {
    console.log(parent);
  }
  getRowId() {
    return this.rowId++;
  }
  deleteDeviceOnClick(e: any, element: any) {
    e.stopPropagation();
  }
  getChildDataState(element: any) {
    return {key: 'Order_Details', parentID: element.OrderID, parentKey: 'OrderID', rootLevel: false};
  }

  editDeviceOnClick(e: MouseEvent, clickedUser: any) {
    e.stopPropagation();
    const dialogRef = this.dialog.open(NewDeviceComponent, {data: {title: 'Edit device'}});

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        //do wathever...
      }
    });
  }
  openEditDeviceDialog(): void {
  }
}
