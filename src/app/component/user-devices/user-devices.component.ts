import { Component, OnInit } from '@angular/core';
import { Owner } from 'src/app/model/owner';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import 'ag-grid-enterprise';
import { Device } from 'src/app/model/device';

@Component({
  selector: 'app-user-devices',
  templateUrl: './user-devices.component.html',
  styleUrls: ['./user-devices.component.css']
})
export class UserDevicesComponent implements OnInit {
  displayedColumns = [
    { field: 'id', headerName: "id", minWidth: 80, cellRenderer: 'agGroupCellRenderer' },
    { field: 'name', headerName: "name", minWidth: 100 },
    { field: 'email', headerName: "email", minWidth: 120 },
    { field: 'created', headerName: "created", minWidth: 210 }
  ];
  defaultColDef = { resizable: true, filter: true, sortable: true };
  dataSource = []; // grid expects all data at once
  gridApi;

  constructor(private dataStorageService: DataStorageService) { }

  ngOnInit(): void {
    console.log('init: UserDevicesComponent')
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();

    window.addEventListener('resize', function () {
      setTimeout(function () {
        this.gridApi?.sizeColumnsToFit();
      });
    });
    this.dataStorageService.fetchOwners().subscribe((data: Owner[]) => {
      this.dataSource = data;
    });
  }
  onSortChanged(e: any /*AgGridEvent*/) {
    e.api.refreshCells();
  }
  onSelectionChanged(e: any) {
    let selectedRows = this.gridApi.getSelectedRows();
    selectedRows.forEach(element => {
    });
  }
  // Level 3 (bottom level), Detail Grid only, no Master / Detail configuration
  gridOptionsLevel3 = {
  }


  // Level 2, configured to be a Master Grid and use Level 3 grid as Detail Grid,
  gridOptionsLevel2 = { 
    detailGridOptions: {
      columnDefs: [
        {field: 'id', headerName: "id", minWidth: 110 },
        { field: 'type', headerName: "type", minWidth: 110 },
        { field: 'owner', headerName: "owner", minWidth: 110 },
        { field: 'firmware', headerName: "firmware", minWidth: 110 },
        { field: 'ffirmware', headerName: "ffirmware", minWidth: 110 },
        { field: 'configuration', headerName: "configuration", minWidth: 110 },
        { field: 'fconfiguration', headerName: "fconfiguration", minWidth: 110 },
        { field: 'apikey', headerName: "apikey", minWidth: 110 },
        { field: 'note', headerName: "note", minWidth: 110 },
        { field: 'enabled', headerName: "enabled", minWidth: 110}
      ],
      defaultColDef: { flex: 1 }
    },
    getDetailRowData: (params) => {
      this.dataStorageService.fetchDevices(params.data.id).subscribe((data: Device[]) => {
        params.successCallback(data);
      });
    }
  }
}
