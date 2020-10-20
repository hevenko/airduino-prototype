import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {MessageColor, MessageService} from './message.service';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import { Owner } from 'src/app/model/owner';
import { Device } from 'src/app/model/device';
import { Region } from 'src/app/model/region';
import { FilterModel } from 'src/app/model/filter-model';
import { RawData } from 'src/app/model/raw-data';
import { Data } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  static i = 0;
  noAccessControlAllowOriginProxy = 'https://cors-anywhere.herokuapp.com/'; //fix thanks to: https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe/43881141#43881141
  dataBus: BehaviorSubject<RawData[]> = new BehaviorSubject<RawData[]>(null);

  constructor(private http: HttpClient,private messageService: MessageService, private filterModel: FilterModel) {
    console.log('DataStorageService' + (++DataStorageService.i));
  }
  sendData(data: RawData[]): void {
    this.dataBus.next(data);
  }
  handleError = (err: HttpErrorResponse) => {
    if (!!err.message) {
      this.messageService.showMessage(err.message, MessageColor.Red);
      return throwError(err.message);
    }
    return throwError(err);
  }
  fetchOwners(): Observable<Owner[]> {
    return this.http.get<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/owners')
      .pipe(
        catchError(this.handleError),
        map(res => {
          return res.data;
        })
    );
  }
  fetchDevices(ownerId: string): Observable<Device[]> {
    return this.http.get<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/devices/' + ownerId)
      .pipe(
        catchError(this.handleError),
        map(res => {
          return res.data;
        })
    );
  }
  fetchSensors(deviceId: string): Observable<Device[]> {
    return this.http.get<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/sensors/' + deviceId)
      .pipe(
        catchError(this.handleError),
        map(res => {
          return res.data;
        })
    );
  }
  fetchRegions(): Observable<Region[]> {
    return this.http.get<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/regions')
      .pipe(
        catchError(this.handleError),
        map(res => {
          return res.data;
        })
    );
  }
  fetchData(): void {
    let filter:any = {};
    filter.sensors = this.filterModel.sensors
    filter.time = this.filterModel.time;
    filter.locations = this.filterModel.locations;
    console.log(JSON.stringify(filter));
    if (!!filter.sensors && !!filter.time && !!filter.locations) {
      this.http.post<Data>(this.noAccessControlAllowOriginProxy + 'http://airduino-server.herokuapp.com/api/v1/data', filter)
      .pipe(
        catchError(this.handleError),
        map(res => {
          if (!!res.error) {
            this.messageService.showMessage(res.error, MessageColor.Red);
          } else if (!res.success) {
            this.messageService.showMessage('Data request failed with no message', MessageColor.Red);
          }
          return res.data;
        })
    ).subscribe((d: RawData[]) => {
      console.log(d);
      this.sendData(d);
    });
    }
  }
}
