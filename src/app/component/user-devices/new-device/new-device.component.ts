import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RowNode } from 'ag-grid-community';
import { DialogData } from 'src/app/shared/dialog-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

export enum Mode {
  Add,
  Edit
}
@Component({
  selector: 'app-new-device',
  templateUrl: './new-device.component.html',
  styleUrls: ['./new-device.component.css']
})
export class NewDeviceComponent implements OnInit {
  title;
  form = new FormGroup({});
  initData: RowNode;
  mode: Mode; //add, edit
  modeEdit = Mode.Edit;
  userName;
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dataStorageService: DataStorageService) {
    this.title = data.title;
    this.initData = data.data;
    this.userName = this.initData.data.name;
    this.setMode(this.initData);
  }
  setMode(data: RowNode) { //this component is used for adding new or editing, hence different modes (Add, Edit)
    this.mode = !!data.data.key ? Mode.Edit : Mode.Add;
  }
  isMode(m: Mode): boolean {
    return this.mode === m;
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      key: new FormControl('1111', [Validators.required]),
      note:  new FormControl('rajkove device'),
    })
    if (this.isMode(Mode.Edit)) {
      this.form.controls['key'].setValue(this.initData.data.key);
      this.form.controls['note'].setValue(this.initData.data.note);
    }
  }
  onSubmit() {
    console.log(this.form.value);
    if(this.isMode(Mode.Add)) {
      this.dataStorageService.newDevice(this.initData.data.id, this.form.value.key, this.form.value.note);
    } else {
      this.initData.data.name = this.form.value.name;
      this.initData.data.email = this.form.value.email;
      this.dataStorageService.editUser(this.initData, this.form.value.auth.password);
    }
  }
}
