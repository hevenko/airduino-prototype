import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RowNode } from 'ag-grid-community';
import { DialogData } from 'src/app/shared/dialog-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-add-devices',
  templateUrl: './add-devices.component.html',
  styleUrls: ['./add-devices.component.css']
})
export class AddDevicesComponent implements OnInit {
  title;
  form = new FormGroup({});
  initData: RowNode;
  userName;
  dataTypes = [];
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dataStorageService: DataStorageService) {
    if(data) {
      this.title = data.title;
      this.initData = data.data;
    }
    dataStorageService.fetchDeviceTypes().subscribe(d => {
      this.dataTypes = d;
    });
  }
  ngOnInit(): void {
    this.form = new FormGroup({
      type: new FormControl('Airduino', [Validators.required]),
      count:  new FormControl('1', [Validators.required]),
    })
  }
  onSubmit() {
    console.log(this.form.value);
  }

}
