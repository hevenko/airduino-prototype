import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

/** when to show error message */
export class CustomControlErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

/** when to show error message */
export class PasswordErrorStateMatcher implements ErrorStateMatcher {

  constructor(private otherPassword: FormControl){}
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return form && control && form.invalid && control.touched && this.otherPassword.touched && (form.touched || form.dirty);     
  }
}