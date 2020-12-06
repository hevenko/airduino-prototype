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
  @ViewChild('cbChecked', { read: ViewContainerRef }) public cbChecked;

  constructor() { }
  
  refresh(params: any): boolean {
    return false;
  }
  agInit(params: ICellRendererParams): void {
    this.gridParams = params;
    this.isChecked = params.value;
  }
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    //throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
  }
  setChecked(e: any) {
    this.gridParams.api.getRowNode(this.gridParams.rowIndex).setDataValue(
      this.gridParams.colDef.field, this.cbChecked.element.nativeElement.checked
    );
  }
}
