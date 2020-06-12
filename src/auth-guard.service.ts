import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterModule,
  RouterStateSnapshot,
  UrlTree,
  UrlSegment
} from '@angular/router';
import { AuthService } from './app/component/auth/auth.service';
import { Observable } from 'rxjs';
import { User } from './app/component/auth/user.model';
import { Injectable } from '@angular/core';
import { AuthComponent } from './app/component/auth/auth.component';
import { MessageService, MessageColor } from './app/shared/service/message.service';
import { Constants } from './app/shared/constants';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router, private messageService: MessageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    console.log(route);
    console.log(state);
    console.log(this.router);
    if ((<any>route.component).name === 'AuthComponent') {
      if (this.authService.user.value) {
        this.messageService.showMessage(Constants.MSG_ALREADY_LOGGED_IN, MessageColor.Green);
        return this.router.navigate(['map']);
      } else {
        return true;
      }
    } else {
      if (this.authService.user.value) {        
        return true;
      } else {
        if ((<any>route.component).name === 'UserListComponent') {          
          this.messageService.showMessage(Constants.MSG_LOGIN_TO_ACCESS, MessageColor.Yellow);
          return this.router.navigate(['map']);
        } else {
          return true;
        }
      }
    }
  }
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
}
