import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthResponseData, AuthService } from './auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import { MessageService, MessageColor } from 'src/app/shared/service/message.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  email = 'aaa@aa.aa';
  password = 'aaaaaa';
  isLoginMode = true;
  isLoading = false;

  constructor(private auth: AuthService, public router: Router, private messageService: MessageService) { }

  ngOnInit() {
  }
  onSubmit(form: NgForm) {
    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;

    if (this.isLoginMode) {
      authObs = this.auth.login(form.value.email, form.value.password);
    } else {
      authObs = this.auth.signup(form.value.email, form.value.password);
    }
    authObs.subscribe(
      resData => {
        console.log(resData);
        this.isLoading = false;
        this.router.navigate(['/map']);
      },
        errorMessage => {
          console.log(errorMessage);
          this.messageService.showMessage(errorMessage, MessageColor.Yellow);
          this.isLoading = false;
        }
      );
  }
  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  loginWithGoogle() {
    console.log('before google auth');
    this.auth.loginWithGoogle().subscribe( (data: any) => console.log( "auth with google result:", data));
  }

  logout() {
    console.log('before logout');
    this.auth.logout().subscribe( (data: any) => console.log( "logged out:", data));
  }

}

