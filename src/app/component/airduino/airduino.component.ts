import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from 'ag-grid-community';
import {ConfirmComponent} from 'src/app/component/dialog/confirm/confirm.component';
import {MessageComponent} from 'src/app/component/dialog/message/message.component';
import { DialogData } from 'src/app/shared/dialog-data';

@Component({
  templateUrl: './airduino.component.html'
})
export class AirduinoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  showConfirmationDialog(dialog: MatDialog, titleText: string): MatDialogRef<any, any> {
    return dialog.open(ConfirmComponent, {data: {title: titleText}});
  }
  showInfoMessage(dialog: MatDialog, titleText: string): MatDialogRef<any, any> {
    return dialog.open(MessageComponent, {data: {title: titleText}});
  }
  showDialog(dialog: MatDialog, height: string, width: string, component: any, title: string, formData: any, afterCloseCallback: any): MatDialogRef<any, any> {
    let d = dialog.open(component, {height: height, width: width, data: {title: title, formData: formData}});
    d.afterClosed().subscribe(afterCloseCallback);
    return d;
  }
}
