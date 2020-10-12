import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {ConfirmComponent} from '../confirm/confirm.component';
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
}
