import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgForm, ValidatorFn, AbstractControl, FormGroup, FormControl, Validators, FormGroupDirective, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { CustomControlErrorStateMatcher, PasswordErrorStateMatcher } from 'src/app/shared/custom-error-state-matcher';
import { AuthService } from '../auth/auth.service';
import { MessageService, MessageColor } from 'src/app/shared/service/message.service';
import { Constants } from 'src/app/shared/constants';

// export function passwordsMismatch(repeatPassword: FormControl): ValidatorFn {
//   return (control: AbstractControl): { [key: string]: any } | null => {
//     const forbidden = repeatPassword.value !== control.value;
//     return forbidden ? { 'passwordsMismatch': { value: control.value } } : null;
//   };
// }

export const passwordsMismatch: any = (control: FormGroup): ValidationErrors | null => {
  const name = control.get('password');
  const alterEgo = control.get('repeatPassword');
  const rezultat = name && alterEgo && name.value !== alterEgo.value ? { 'passwordsMismatch': true } : null;
  return rezultat;
};

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  _userName = 'dddd';
  _email = 'dd@dd.dd';
  _password = 'dddddd';
  _repeatPassword = 'dddddd';
  userForm: FormGroup;
  matcher: CustomControlErrorStateMatcher;
  passwordMatcher: PasswordErrorStateMatcher;
  repeatPasswordMatcher: PasswordErrorStateMatcher;

  constructor(public router: Router, private authService: AuthService, private messageService: MessageService) { }

  get userName() { return this.userForm.get('userName'); };
  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
  get repeatPassword() { return this.userForm.get('repeatPassword'); }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      userName: new FormControl(this._userName, [Validators.required]),
      email: new FormControl(this._email, [Validators.required]),
      password: new FormControl(this._password, [Validators.required]),
      repeatPassword: new FormControl(this._repeatPassword, [Validators.required])
    }, { validators: passwordsMismatch });

    this.matcher = new CustomControlErrorStateMatcher();
    this.passwordMatcher = new PasswordErrorStateMatcher(this.repeatPassword as FormControl);
    this.repeatPasswordMatcher = new PasswordErrorStateMatcher(this.password as FormControl);
  }

  onSubmit() {
    this.authService.signup(this.email.value, this.password.value).subscribe(
      resData => {
        console.log(resData);
        this.messageService.showMessage(Constants.MSG_REGISTRATION_SUCCESS, MessageColor.Green);
        this.router.navigate(['/auth']);
      },
        errorMessage => {
          console.log(errorMessage);
          this.messageService.showMessage(errorMessage, MessageColor.Yellow);
        }
      );
  }
  showPassMismatch(): boolean {
    return;
  }
}
