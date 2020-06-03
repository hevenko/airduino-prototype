import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from '../auth/auth.component';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {
  isAuthenticated = false;

  constructor(private breakpointObserver: BreakpointObserver,
    private authService: AuthService, private router: Router) {

  }

  ngOnInit(): void {
    this.authService.user.subscribe(value => {
      this.isAuthenticated = !!value;
    });
  }

  authenticationOnCick() {
    if(!this.isAuthenticated) {
      this.router.navigate(['/auth']);
    } else {
      this.authService.logout();
    }
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
