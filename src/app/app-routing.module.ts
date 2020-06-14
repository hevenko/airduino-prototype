import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapComponent } from './component/map/map.component';
import { UserListComponent } from './component/user-devices/user-list.component';
import { AuthComponent } from './component/auth/auth.component';
import { AuthGuardService } from 'src/auth-guard.service';
import { NewUserComponent } from './component/new-user/new-user.component';


const routes: Routes = [
  {path: '', redirectTo: '/map', pathMatch: 'full' },
  {path: 'map', component: MapComponent},
  {path: 'userDevices', component: UserListComponent, canActivate: [AuthGuardService]},
  {path: 'auth', component: AuthComponent, canActivate: [AuthGuardService]},
  {path: 'newUser', component: NewUserComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
