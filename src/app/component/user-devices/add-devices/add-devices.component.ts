import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RowNode } from 'ag-grid-community';
import { from } from 'rxjs';
import { filter, map } from 'rxjs/operators';
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
  initData: any;
  userName;
  dataTypes = [];
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dataStorageService: DataStorageService) {
    if(data) {
      this.title = data.title;
      this.initData = data.data;
    }
  }
  ngOnInit(): void {

    this.form = new FormGroup({
      type: new FormControl('', [Validators.required]),
      count:  new FormControl('1', [Validators.required]),
    })

    from(this.dataStorageService.fetchDeviceTypes()).pipe(
      map((d: any[]) => {return d.filter(v => {return v.initgroupowner === this.initData.groupOwnerId})})).subscribe((d: any[]) => {
      this.dataTypes = d;
      if(this.dataTypes.length === 1) {
        this.form.controls['type'].setValue(this.dataTypes[0].id)
      }
    });
  }
  onSubmit() {
    console.log(this.form.value);
  }

}
