import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'app-boolean-renderer-for-ag-grid',
  templateUrl: './boolean-renderer-for-ag-grid.component.html',
  styleUrls: ['./boolean-renderer-for-ag-grid.component.css']
})
export class BooleanRendererForAgGridComponent implements OnInit, ICellRendererAngularComp {
  isChecked: boolean;

  constructor() { }
  
  refresh(params: any): boolean {
    return false;
  }
  agInit(params: ICellRendererParams): void {
    this.isChecked = params.data.rowChecked;
  }
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    
  }

  ngOnInit(): void {
  }

}
