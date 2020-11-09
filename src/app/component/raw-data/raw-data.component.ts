import { Component, OnDestroy, OnInit } from '@angular/core';
import { RawData } from 'src/app/model/raw-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { SelectionModel } from '@angular/cdk/collections';
import { CustomLoadingOverlay } from '../map/ag-grid.ts/custom-loading-overlay.component';
import { CustomNoRowsOverlay } from '../map/ag-grid.ts/custom-no-rows-overlay.component';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
  styleUrls: ['./raw-data.component.css']
})
export class RawDataComponent implements OnInit, OnDestroy {
  displayedColumns = [
    {field: 'pm10', minWidth:110},
    {field: 'pm2_5', minWidth:80},
    {field: 'so2', minWidth:60},
    {field: 'co', minWidth:80},
    {field: 'o3', minWidth:80},
    {field: 'pb', minWidth:80},
    {field: 'hc', minWidth:80},
    {field: 'voc', minWidth:80},
    {field: 'temp', minWidth:80},
    {field: 'humidity', minWidth:120},
    {field: 'pressure', minWidth:120},
    {field: 'gps', minWidth:200},
    {field: 'battery', minWidth:120},
    {field: 'measured', minWidth:200, sort:'asc'},
    {field: 'aqi', minWidth:80}
  ];
  defaultColDef = { resizable: true, filter: true, sortable: true };
  dataSource: RawData[] = [];// grid expects all data at once

  frameworkComponents;
  loadingOverlayComponent;
  loadingOverlayComponentParams;
  noRowsOverlayComponent;
  noRowsOverlayComponentParams;
  isLoadingData = true;
  currentRowCount;
  gridApi;
  subscriptions = new Subscription(); //parent for all subscription

  constructor(private dataStorageService: DataStorageService) {
    this.frameworkComponents = {
      customLoadingOverlay: CustomLoadingOverlay,
      customNoRowsOverlay: CustomNoRowsOverlay,
    };
    this.loadingOverlayComponent = 'customLoadingOverlay';
    this.loadingOverlayComponentParams = {
      loadingMessage: 'Loading...('+this.gridApi?.getModel().getRowCount()+')',
    };
    this.noRowsOverlayComponent = 'customNoRowsOverlay';
    this.noRowsOverlayComponentParams = {
      noRowsMessageFunc: function () {
        return 'Sorry - no rows!';
      },
    };
  }
  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
    this.gridApi = null;
  }

  ngOnInit(): void {
  }
  onGridReady(params) {
    this.gridApi = params.api;
    //this.gridApi.hideOverlay();
    params.api.sizeColumnsToFit();
    this.refreshCurrentRowCount();
    window.addEventListener('resize', function () {
      setTimeout(function () {
        this.gridApi?.sizeColumnsToFit();
      });
    });
    this.subscriptions.add(this.dataStorageService.availableDataBus.subscribe((d: RawData[]) => {
      if(this.gridApi.getModel().getRowCount() == 0) {
        this.gridApi?.showLoadingOverlay();
        this.gridApi.applyTransaction({ add: d });
        this.gridApi?.sizeColumnsToFit();
      }
    }));
    this.subscriptions.add(this.dataStorageService.pageOfDataBus.subscribe((d: RawData[]) => {
      if(this.gridApi.getModel().getRowCount() != 0) {
        this.refreshCurrentRowCount();
        this.gridApi?.showLoadingOverlay();
        this.gridApi.applyTransaction({ add: d });
        this.gridApi?.sizeColumnsToFit();
      }
    }));
    this.subscriptions.add(this.dataStorageService.loadingStatusBus.subscribe((s: boolean) =>{
      this.gridApi?.showLoadingOverlay();
      this.isLoadingData = s;
      if(this.isLoadingData) {
        this.gridApi?.setRowData([]);
      } else {
        this.gridApi?.hideOverlay();
        console.log('grid count:' + this.gridApi?.getModel().getRowCount());
      }
    }));
  }

  refreshCurrentRowCount = () => {
    this.currentRowCount = this.gridApi?.getModel().getRowCount();
  }

  onBtnExport() {
    const params = this.gridApi;
    params.suppressQuotes = false;
    params.columnSeparator = ";";
    this.gridApi.exportDataAsCsv(params);
  }

  selectBySearch(search: string) {
    this.gridApi.forEachNode(node => {
      const keys = Object.keys(node.data);
      keys.find(column => {
        if ((node.data[column] === undefined) || (node.data[column] === null)) {
          return false;
        }
        let selected: boolean;
        if (Array.isArray(node.data[column])) {
          const values = node.data[column];
          selected = !!values.find(value => ('' + value).includes(search));
          node.setSelected(selected);
        } else {
          const value = ('' + node.data[column]).toLowerCase();
          selected = value.includes(search);
          node.setSelected(selected);
        }
        return selected;
      });
    });
  }
}
