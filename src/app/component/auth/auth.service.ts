import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { User } from './user.model';
import { tap } from 'rxjs/internal/operators/tap';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { MessageService, MessageColor } from 'src/app/shared/service/message.service';
import { Constants } from 'src/app/shared/constants';
import {HttpParams} from "@angular/common/http";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router, private messageService: MessageService) { }

  FireBaseLogin(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCFXALbVVczntBF7Sfhyq2DnUFTYVkB97s',
      {
        email: email,
        password: password,
        returnSecureToken: true
      }).pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }
  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      'http://localhost:5000/api/v1/auth/local',
      {
        email: email,
        password: password,
        returnSecureToken: true
      }).pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }
  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCFXALbVVczntBF7Sfhyq2DnUFTYVkB97s',
      {
        email: email,
        password: password,
        returnSecureToken: true
      }).pipe(
        catchError(this.handleError)/* ,
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        } ) */
      );
  }
  loginWithGoogle() {
    return this.http.get('http://localhost:5000/api/v1/auth/google');
  }
  loginWithFacebook() {
    return this.http.get('http://localhost:5000/api/v1/auth/facebook');
  }
  loginWithTwitter() {
    return this.http.get('http://localhost:5000/api/v1/auth/twitter');
  }
  logout() {
    // cleanup
    this.firebaseLogout();
    return this.http.delete('http://localhost:5000/api/v1/auth');
  }
  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    console.log("login user with email:", email);
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }
  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) { // checks token validity
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  firebaseLogout() {
    localStorage.removeItem('userData');
    this.user.next(null);
    this.messageService.showMessage(Constants.MSG_LOGGED_OUT, MessageColor.Green);
    this.router.navigate(['/map']);
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    let msg: string = errorRes.error.error.message;
    let msgParts: string[] = msg.split(':').map(p => p.trim());


    switch (msgParts[0]) {
      case 'EMAIL_EXISTS':
        errorMessage = Constants.MSG_DUPLICATE_MAIL;
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = Constants.MSG_UNKNOWN_MAIL;
        break;
      case 'INVALID_PASSWORD':
        errorMessage = Constants.MSG_BAD_PASSWORD;
        break;
      case 'WEAK_PASSWORD':
        errorMessage = msgParts[1];
        break;
      case 'INVALID_EMAIL':
        errorMessage = Constants.MSG_BAD_EMAIL;
        break;
    }
    return throwError(errorMessage);
  }
}
