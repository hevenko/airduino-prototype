import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RowNode } from 'ag-grid-community';
import { from } from 'rxjs';
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
  deviceTypeList;
  firmwareList;
  configList;
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
    this.deviceTypeList = this.dataStorageService.fetchDeviceTypes();
    this.firmwareList = this.dataStorageService.fetchFirmwares();
    this.configList = this.dataStorageService.fetchConfigurations();

    this.form = new FormGroup({
      type: new FormControl('', [Validators.required]),
      firmware: new FormControl('', [Validators.required]),
      config: new FormControl('', [Validators.required]),
      key: new FormControl('1111', [Validators.required]),
      note:  new FormControl('rajkove device'),
    })
    if (this.isMode(Mode.Edit)) {
      this.form.controls['key'].setValue(this.initData.data.key);
      this.form.controls['note'].setValue(this.initData.data.note);
    }
    from(this.deviceTypeList).subscribe((v: any[]) => {
      this.form.controls['type'].setValue(v[0].id);
    });
    from(this.firmwareList).subscribe((v: any[]) => {
      this.form.controls['firmware'].setValue(v[0].id);
    });
    from(this.configList).subscribe((v: any[]) => {
      this.form.controls['config'].setValue(v[0].id);
    });
  }
  onSubmit() {
    console.log(this.form.value);
    if(this.isMode(Mode.Add)) {
      this.dataStorageService.newDevice(this.initData.data.id, this.form.value.key,
        this.form.value.note, this.form.value.type, this.form.value.firmware, this.form.value.config);
    } else {
      this.initData.data.name = this.form.value.name;
      this.initData.data.email = this.form.value.email;
      this.dataStorageService.editUser(this.initData, this.form.value.auth.password);
    }
  }
}
