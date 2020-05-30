import { Component, OnInit, Input } from '@angular/core';
import { IDataState, RemoteLoDService, IoDataResponse } from '../remote-lod.service';

@Component({
  selector: 'app-device-sensor',
  templateUrl: './device-sensor.component.html',
  styleUrls: ['./device-sensor.component.css']
})
export class DeviceSensorComponent implements OnInit {
  displayedColumns: string[] = ['ProductID', 'UnitPrice'];
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
  getRowId() {
    return this.rowId++;
  }
}

