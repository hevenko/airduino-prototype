import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MainNavComponent } from './component/main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DropdownDirective } from './directive/dropdown.directive';
import { LocationComponent } from './component/filter/location-filter/location.component';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SensorComponent } from './component/filter/sensor-filter/sensor.component';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { TimeComponent } from './component/filter/time-filter/time.component';
import { MatInputModule } from '@angular/material/input';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import {MatDatepickerModule} from "@angular/material/datepicker";
import { PresetFilterComponent } from './component/filter/preset-filter/preset-filter.component';
import { AlertComponent } from './component/filter/preset-filter/alert/alert.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MapComponent } from './component/map/map.component';
import {MatTableModule} from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { RemoteLoDService } from './component/user-devices/remote-lod.service';
import { NewDeviceComponent } from './component/user-devices/new-device/new-device.component';
import {MatDialogModule} from '@angular/material/dialog';
import { AuthComponent } from './component/auth/auth.component';
import { ShowMessageComponent } from './component/show-message/show-message.component';
import { AuthGuardService } from 'src/auth-guard.service';
import { NewUserComponent } from './component/new-user/new-user.component';
import { UserComponent } from './component/user/user.component';
import { RawDataComponent } from './component/raw-data/raw-data.component';
import { GraphComponent } from './component/graph/graph.component';
import { BedacekComponent } from './bedacek/bedacek.component';
import { LoginComponent } from './component/login/login.component';
import { ConfirmComponent } from './component/dialog/confirm/confirm.component';
import { AirduinoComponent } from './component/airduino/airduino.component';
import { MessageComponent } from './component/dialog/message/message.component';
import { FilterModel } from './model/filter-model';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { AgGridModule } from 'ag-grid-angular';
import { UserDevicesComponent } from './component/user-devices/user-devices.component';
import { CheckRowRendererComponent } from './component/check-row-renderer/check-row-renderer.component';
import { AddUserComponent } from './component/user-devices/add-user/add-user.component';
import { AddDevicesComponent } from './component/user-devices/add-devices/add-devices.component';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    DropdownDirective,
    LocationComponent,
    SensorComponent,
    TimeComponent,
    PresetFilterComponent,
    AlertComponent,
    MapComponent,
    NewDeviceComponent,
    AuthComponent,
    ShowMessageComponent,
    NewUserComponent,
    UserComponent,
    RawDataComponent,
    GraphComponent,
    BedacekComponent,
    LoginComponent,
    ConfirmComponent,
    AirduinoComponent,
    MessageComponent,
    UserDevicesComponent,
    CheckRowRendererComponent,
    AddUserComponent,
    AddDevicesComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatExpansionModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    SatDatepickerModule,
    SatNativeDateModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTableModule,
    HttpClientModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    AgGridModule.withComponents([])
  ],
  providers: [RemoteLoDService, AuthGuardService, FilterModel],
  bootstrap: [AppComponent]
})
export class AppModule { }
