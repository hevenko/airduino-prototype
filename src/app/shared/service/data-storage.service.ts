import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {MessageColor, MessageService} from './message.service';
import {Observable, throwError} from 'rxjs';
import { Owner } from 'src/app/model/owner';
import { Data } from '@angular/router';
import { Device } from 'src/app/model/device';
import { Region } from 'src/app/model/region';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  static i = 0;
  noAccessControlAllowOriginProxy = 'https://cors-anywhere.herokuapp.com/'; //fix thanks to: https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe/43881141#43881141

  constructor(private http: HttpClient,private messageService: MessageService) {
    console.log('DataStorageService' + (++DataStorageService.i));
  }

  fetchOwners(): Observable<Owner[]> {
    return this.http.get<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/owners')
      .pipe(
        catchError(this.handleError),
        map(recipes => {
          return recipes.data;
        })
    );
  }
  fetchDevices(ownerId: string): Observable<Device[]> {
    return this.http.get<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/devices/' + ownerId)
      .pipe(
        catchError(this.handleError),
        map(recipes => {
          return recipes.data;
        })
    );
  }
  fetchSensors(deviceId: string): Observable<Device[]> {
    return this.http.get<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/sensors/' + deviceId)
      .pipe(
        catchError(this.handleError),
        map(recipes => {
          return recipes.data;
        })
    );
  }
  fetchRegions(): Observable<Region[]> {
    return this.http.get<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/regions')
      .pipe(
        catchError(this.handleError),
        map(recipes => {
          return recipes.data;
        })
    );
  }
  handleError = (err: HttpErrorResponse) => {
    if (!!err.message) {
      this.messageService.showMessage(err.message, MessageColor.Red);
      return throwError(err.message);
    }
    return throwError(err);
  }
}
