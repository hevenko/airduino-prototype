import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { User } from './user.model';
import { tap } from 'rxjs/internal/operators/tap';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { MessageService, MessageColor } from 'src/app/shared/service/message.service';
import { Constants } from 'src/app/shared/constants';

export interface AuthResponseData {
  kind?: string;
  idToken?: string;
  name?: string;
  email?: string;
  refreshToken?: string;
  expiresIn?: string;
  localId?: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  userDataBus = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;
  server = Constants.SERVER_URL;
  user: User;

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
            resData.idToken
          );
        })
      );
  }
  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      this.server + 'auth/local', { email, password })
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            email,
            Constants.DUMMY_LOCAL_ID,
            Constants.DUMMY_TOKEN_ID
          );
        })
      );
  }
  FireBaseSignup(email: string, password: string) {
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
  signup(name: string, email: string, password: string) {
    return this.http.post(this.server + 'owners/id', { name, email, password }).pipe(
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
    return this.http.get(this.server + 'auth/google');
  }
  loginWithFacebook() {
    return this.http.get(this.server + 'auth/facebook');
  }
  loginWithTwitter() {
    return this.http.get(this.server + 'auth/twitter');
  }
  logout() {
    // cleanup
    this.firebaseLogout();
    return this.http.delete(this.server + 'auth');
  }
  private handleAuthentication(
    email: string,
    userId: string,
    token: string
  ) {
    console.log("login user with email:", email);
    const expirationDate = new Date(new Date().getTime() + Constants.INACTIVE_PERIOD_LOGOUT * 1000);
    this.user = new User(email, userId, token, expirationDate);
    this.setAutoLogoutTime();
    localStorage.setItem('userData', JSON.stringify(this.user));
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

    this.user = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (this.user.token) { // checks token validity
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.setAutoLogoutTime();
    }
  }
  setAutoLogoutTime() {
    let expirationDuration: number = Constants.INACTIVE_PERIOD_LOGOUT * 1000;
    clearTimeout(this.tokenExpirationTimer);
    // autologout
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
    this.user.tokenExpirationDate = new Date(new Date().getTime() + Constants.INACTIVE_PERIOD_LOGOUT * 1000);
    this.userDataBus.next(this.user);
  }
  firebaseLogout() {
    clearTimeout(this.tokenExpirationTimer);
    localStorage.removeItem('userData');
    this.userDataBus.next(null);
    this.messageService.showMessage(Constants.MSG_LOGGED_OUT, MessageColor.Green);
    this.router.navigate(['/map']);
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    console.log(errorRes);    
    if (!!errorRes.error) {
      if(!!errorRes.error.error) {
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
      } else {
        errorMessage = errorRes.error;
      }
    }
    return throwError(errorMessage);
  }
}
