import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dataStorageService: DataStorageService) {
    this.title = data.title;
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('rajko', [Validators.required]),
      email:  new FormControl('rajko@rajko.com', [Validators.required, Validators.email]),
      auth: new FormGroup({
        password:  new FormControl('', [Validators.required]),
        passwordAgain:  new FormControl('', [Validators.required])
      },{validators: this.passwordsMatchValidator()})
    })
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
    this.dataStorageService.newUser(this.form.value.name, this.form.value.email, this.form.value.auth.password);
  }
  showPasswordError(): boolean {
    return (this.form.controls['auth'] as FormGroup)?.controls['password']?.hasError('passwordsDontMatch');
  }
}
