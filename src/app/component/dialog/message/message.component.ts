import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogData} from 'src/app/shared/dialog-data';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  title = 'Message?'
  constructor(@Inject(MAT_DIALOG_DATA) private data: DialogData) { }

  ngOnInit(): void {
    this.title = !!this.data ? this.data.title : this.title;
  }

}
