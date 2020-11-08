import { Component } from '@angular/core';
import { INoRowsOverlayAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-no-rows-overlay',
  template:
    `<div class="ag-overlay-loading-center">` +
    `   <i class="far fa-frown"> {{params.noRowsMessageFunc()}} </i>` +
    `</div>`,
})
export class CustomNoRowsOverlay implements INoRowsOverlayAngularComp {
  params: any;

  agInit(params): void {
    this.params = params;
  }
}