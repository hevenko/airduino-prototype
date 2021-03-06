import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogData} from 'src/app/shared/dialog-data';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {
  title = 'Are you sure?';
  constructor(@Inject(MAT_DIALOG_DATA) private data: DialogData) { }

  ngOnInit(): void {
    this.title = !!this.data ? this.data.title : this.title;
  }

}
