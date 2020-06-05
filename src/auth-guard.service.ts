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

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    console.log(route);
    console.log(state);
    console.log(this.router);
    if ((<any>route.component).name === 'AuthComponent') {
      if (this.authService.user.value) {
        return this.router.navigate(['map']);
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
}
