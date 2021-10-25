import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../auth/user.model';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  faUserPlus = faUserPlus;
  isAuthenticated = false;
  welcomeLabel = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.loginBus.subscribe((value: User) => {
      this.isAuthenticated = !!value;
      this.welcomeLabel = this.isAuthenticated ? value.email : '';
    });
  }
  getLabel(): string {
    return this.isAuthenticated ? this.welcomeLabel : 'Login';
  }
  login() {
    if(!this.isAuthenticated) {
      this.router.navigate(['/auth']);
    } else {
      this.authService.logout();
    }
  }
  logout() {
      this.authService.logout();
  }

}
