import { Component, Input } from '@angular/core';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-loading-overlay',
  template:
    `<div class="ag-overlay-loading-center" style="background-color: lightsteelblue;">` +
    `   <i class="fas fa-hourglass-half">{{loadingMessage}} </i>` +
    `</div>`,
})
export class CustomLoadingOverlay implements ILoadingOverlayAngularComp {
  loadingMessage = '';
  rowCount = 0;
  constructor(private dataStorage: DataStorageService) {}

  agInit(params): void {
    this.dataStorage.availableDataBus.subscribe(d => {
      this.rowCount = d?.length;
      this.loadingMessage = 'Loading...(' + this.rowCount + ')';
    });
    this.dataStorage.loadingStatusBus.subscribe(v => {
      if(!v) {
        this.loadingMessage = 'Done...(' + this.rowCount + ')';
      }
    });
  }
}