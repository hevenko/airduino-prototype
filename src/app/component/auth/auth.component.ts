import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthResponseData, AuthService } from './auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {MessageService, MessageColor} from 'src/app/shared/service/message.service';
import { Constants } from '../../shared/constants';
import { User } from './user.model';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  email = 'bela@bela.com';
  password = 'bela';
  isLoginMode = true;
  isLoading = false;
  constants = Constants;

  constructor(private auth: AuthService, public router: Router, private messageService: MessageService) { }

  ngOnInit() {
    let sub = this.auth.loginBus.subscribe((u: User) => {
      if(!u) return;
      console.log(u);
      this.isLoading = false;
      sub.unsubscribe(); //prevents infinite loop (next line will try to navigate so ngOnInit is called infinitely)
      this.router.navigate(['/map']);
    });
    this.auth.loginErrBus.subscribe((errorMessage: string) => {
      console.log(errorMessage);
      this.messageService.showMessage(errorMessage, MessageColor.Yellow);
      this.isLoading = false;
    });
  }
  onSubmit(form: NgForm) {

    this.isLoading = true;

    if (this.isLoginMode) {
      try {
        this.auth.login(form.value.email, form.value.password);        
      } catch (error) {
        this.messageService.showMessage(error, MessageColor.Yellow);        
      }
    } else {
      this.auth.signup(form.value.name, form.value.email, form.value.password);
    }
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

