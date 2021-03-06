import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'app-check-row-renderer',
  templateUrl: './check-row-renderer.component.html',
  styleUrls: ['./check-row-renderer.component.css']
})
export class CheckRowRendererComponent implements OnInit, ICellRendererAngularComp {
  isChecked: boolean;
  gridParams;

  constructor() { }
  
  refresh(params: any): boolean {
    return false;
  }
  agInit(params: ICellRendererParams): void {
    this.gridParams = params;
    this.isChecked = params.data.rowChecked;
  }
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    //throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
  }
  setChecked(e: any) {
    this.gridParams.node.setDataValue(
      this.gridParams.colDef.field, e.currentTarget.checked
    );
  }
}
