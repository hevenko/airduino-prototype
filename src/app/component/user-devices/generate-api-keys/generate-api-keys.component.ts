import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RowNode } from 'ag-grid-community';
import { DialogData } from 'src/app/shared/dialog-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-generate-api-keys',
  templateUrl: './generate-api-keys.component.html',
  styleUrls: ['./generate-api-keys.component.css']
})
export class GenerateApiKeysComponent implements OnInit {
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
