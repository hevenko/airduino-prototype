import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RowNode } from 'ag-grid-community';
import { Mode } from 'src/app/shared/ComponentMode';
import { DialogData } from 'src/app/shared/dialog-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit, AfterViewInit {
  title;
  form = new FormGroup({});
  initData: RowNode;
  mode: Mode; //add, edit
  modeEdit = Mode.Edit
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dataStorageService: DataStorageService) {
    this.title = data.title;
    this.initData = data.data;
    this.setMode(this.initData);
  }
  setMode(data: any) { //this component is used for adding new or editing user, hence different modes (Add, Edit)
    this.mode = !!data ? Mode.Edit : Mode.Add;
  }
  isMode(m: Mode): boolean {
    return this.mode === m;
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('rajko', [Validators.required]),
      email:  new FormControl('rajko@rajko.com', [Validators.required, Validators.email]),
      auth: new FormGroup({
        password:  new FormControl(),
        passwordAgain:  new FormControl()
      },{validators: this.passwordsMatchValidator()})
    })
    if (this.isMode(Mode.Add)) {
      let fgAuth = (this.form.controls['auth'] as FormGroup);
      fgAuth.controls['password']?.setValidators([Validators.required]);
      fgAuth.controls['passwordAgain']?.setValidators([Validators.required]);
    } else {
      this.form.controls['name'].setValue(this.initData.data.name);
      this.form.controls['email'].setValue(this.initData.data.email);
    }
  }
  passwordsMatchValidator(): ValidatorFn {
    return (control: FormGroup): ValidationErrors | null => {
      let cPassword = control.controls["password"];
      let cPasswordAgain = control.controls["passwordAgain"];
      if (cPassword?.value == cPasswordAgain?.value) {
        cPassword.setErrors(null);
        cPasswordAgain.setErrors(null);
        return null;
      } else {
        let err = {passwordsDontMatch: true};
        cPassword.setErrors(err);
        cPasswordAgain.setErrors(err);
        return err;
      }
    };    
  }
  onSubmit() {
    console.log(this.form.value);
    if(this.isMode(Mode.Add)) {
      this.dataStorageService.newUser(this.form.value.name, this.form.value.email, this.form.value.auth.password);
    } else {
      this.initData.data.name = this.form.value.name;
      this.initData.data.email = this.form.value.email;
      this.dataStorageService.editUser(this.initData, this.form.value.auth.password);
    }
  }
  showPasswordError(): boolean {
    return (this.form.controls['auth'] as FormGroup)?.controls['password']?.hasError('passwordsDontMatch');
  }
}
