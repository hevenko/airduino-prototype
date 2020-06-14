import { Component, OnInit } from '@angular/core';
import { PasswordErrorStateMatcher, CustomControlErrorStateMatcher } from 'src/app/shared/custom-error-state-matcher';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MessageService, MessageColor } from 'src/app/shared/service/message.service';


export const passwordsMismatch: any = (control: FormGroup): ValidationErrors | null => {
  const pwd = control.get('newPassword');
  const repeatPwd = control.get('repeatNewPassword');
  const result = pwd && repeatPwd && pwd.value !== repeatPwd.value ? { 'passwordsMismatch': true } : null;
  return result;
};


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userForm: FormGroup;
  matcher: CustomControlErrorStateMatcher;
  passwordMatcher: PasswordErrorStateMatcher;
  repeatPasswordMatcher: PasswordErrorStateMatcher;

  constructor(public router: Router, private authService: AuthService, private messageService: MessageService) { }

  get userName() { return this.userForm.get('userName'); };
  get email() { return this.userForm.get('email'); }
  get newPassword() { return this.userForm.get('newPassword'); }
  get repeatNewPassword() { return this.userForm.get('repeatNewPassword'); }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      userName: new FormControl(this.authService.user.value.email, [Validators.required]),
      email: new FormControl(this.authService.user.value.email, [Validators.required]),
      newPassword: new FormControl(''),
      repeatNewPassword: new FormControl('')
    }, { validators: passwordsMismatch });

    this.matcher = new CustomControlErrorStateMatcher();
    this.passwordMatcher = new PasswordErrorStateMatcher(this.repeatNewPassword as FormControl);
    this.repeatPasswordMatcher = new PasswordErrorStateMatcher(this.newPassword as FormControl);
  }
  onSubmit() {
    this.messageService.showMessage('Not implemented...', MessageColor.Yellow);
  }
}
