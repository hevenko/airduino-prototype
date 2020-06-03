import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapComponent } from './component/map/map.component';
import { UserListComponent } from './component/user-devices/user-list.component';
import { AuthComponent } from './component/auth/auth.component';


const routes: Routes = [
  {path: '', redirectTo: '/userDevices', pathMatch: 'full' },
  {path: 'map', component: MapComponent},
  {path: 'userDevices', component: UserListComponent},
  {path: 'auth', component: AuthComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
