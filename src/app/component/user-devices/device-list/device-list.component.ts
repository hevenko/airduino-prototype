import { Component, OnInit, Input } from '@angular/core';
import { RemoteLoDService, IDataState, IoDataResponse, DataResponse } from '../remote-lod.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit {
  displayedColumns: string[] = ['OrderID', 'CustomerID', 'DeleteDevice'];
  dataSource = [];
  expandedElement: any[] = [];
  rowId = 0;
  @Input() dataState: IDataState; // = { key: 'Orders', parentID: 'ALFKI', parentKey: 'CustomerID', rootLevel: false };

  constructor(private remoteService: RemoteLoDService) { }

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

    let ind = this.expandedElement.map((e) => { return e.CustomerID }).indexOf(element.CustomerID);
    if (ind !== -1) {
      this.expandedElement.splice(ind, 1);
    } else {
      this.expandedElement.push(element);
    }
  }
  shouldShowDetailRow(element: any): string {
    let rezultat = this.expandedElement.map((e) => { return e.CustomerID }).indexOf(element.CustomerID) !== -1 ? 'expanded' : 'collapsed';
    return rezultat;
  }
  consoleLog(parent: any) {
    console.log(parent);
  }
  getRowId() {
    return this.rowId++;
  }
  deleteDeviceOnClick(event: any, element: any) {

  }
}
