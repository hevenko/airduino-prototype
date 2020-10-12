import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {ConfirmComponent} from 'src/app/component/dialog/confirm/confirm.component';
import {MessageComponent} from 'src/app/component/dialog/message/message.component';

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
}
