import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RowNode } from 'ag-grid-community';
import { from } from 'rxjs';
import { Mode } from 'src/app/shared/ComponentMode';
import { DialogData } from 'src/app/shared/dialog-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-new-device',
  templateUrl: './new-device.component.html',
  styleUrls: ['./new-device.component.css']
})
export class NewDeviceComponent implements OnInit {
  title;
  form = new FormGroup({});
  mode: Mode; //add, edit
  modeEdit = Mode.Edit;
  
  ownerName;
  ownerId;
  deviceId;
  devicetype;
  firmware;
  config;
  apikey;
  public;
  note;
  
  deviceTypeList;
  firmwareList;
  configList;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dataStorageService: DataStorageService) {
    this.title = data.title;
    this.ownerName = data.data.ownerName;
    this.ownerId = data.data.ownerId;
    this.deviceId = data.data.deviceId;
    this.devicetype = data.data.devicetype;
    this.firmware = data.data.firmware;
    this.config = data.data.config;
    this.apikey = data.data.apikey;
    this.public = data.data.public;
    this.note = data.data.note;
    this.setMode(data.data);
  }
  setMode(data: any) { //this component is used for adding new or editing, hence different modes (Add, Edit)
    this.mode = !!data.apikey ? Mode.Edit : Mode.Add;
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
      type: new FormControl({value: '', disabled: this.isMode(this.modeEdit)}, [Validators.required]),
      firmware: new FormControl({value: '', disabled: this.isMode(this.modeEdit)}, [Validators.required]),
      config: new FormControl({value: '', disabled: this.isMode(this.modeEdit)}, [Validators.required]),
      key: new FormControl('1111', [Validators.required]),
      public: new FormControl(false, [Validators.required]),
      note:  new FormControl('rajkove device'),
    })
    if (this.isMode(Mode.Edit)) {
      this.form.controls['type'].setValue(this.devicetype);
      this.form.controls['firmware'].setValue(this.firmware);
      this.form.controls['config'].setValue(this.config);
      this.form.controls['key'].setValue(this.apikey);
      this.form.controls['public'].setValue(this.public);
      this.form.controls['note'].setValue(this.note);
    }
    if(this.isMode(Mode.Add)) {
      // from(this.deviceTypeList).subscribe((v: any[]) => {
      //   this.form.controls['type'].setValue(v[0].id);
      // });
      from(this.firmwareList).subscribe((v: any[]) => {
        this.form.controls['firmware'].setValue(v[0].id);
      });
      from(this.configList).subscribe((v: any[]) => {
        this.form.controls['config'].setValue(v[0].id);
      });  
    }
  }
  onSubmit() {
    console.log(this.form.value);
    if(this.isMode(Mode.Add)) {
      this.dataStorageService.newDevice(this.ownerId, this.form.value.key,
        this.form.value.note, this.form.value.type, this.form.value.firmware, this.form.value.config);
    } else {
      this.dataStorageService.editDevice(this.deviceId, this.form.value.type,this.form.value.firmware, this.form.value.config,
        this.form.value.key, this.form.value.note, this.form.value.public);
    }
  }
}
