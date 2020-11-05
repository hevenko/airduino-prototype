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
import { Constants } from '../../shared/constants';
import { GeoJSONFeature } from 'src/app/model/geo-json-feature';
import { format } from 'date-fns';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  serverURL = Constants.SERVER_URL;
  static i = 0;
  //noAccessControlAllowOriginProxy = 'https://thingproxy.freeboard.io/fetch/'; //fix thanks to: https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe/43881141#43881141
  noAccessControlAllowOriginProxy = ''; //no need to use proxy - ili treba se dobro posrati
  mapDataBus: BehaviorSubject<RawData[]> = new BehaviorSubject<RawData[]>(null);
  drawDataBus: BehaviorSubject<GeoJSONFeature[]> = new BehaviorSubject<GeoJSONFeature[]>(null);

  constructor(private http: HttpClient,private messageService: MessageService, private filterModel: FilterModel) {
    console.log('DataStorageService' + (++DataStorageService.i));
  }
  getURL = (resource: string): string => this.noAccessControlAllowOriginProxy + this.serverURL + resource;

  sendMapData(data: RawData[]): void {
    this.mapDataBus.next(data);
  }
  sendLocationData(data: GeoJSONFeature[]): void {
    this.drawDataBus.next(data);
  }
  handleError = (err: HttpErrorResponse) => {
    if (!!err.message) {
      this.messageService.showMessage(err.message, MessageColor.Red);
      return throwError(err.message);
    }
    return throwError(err);
  }
  fetchOwners(): Observable<Owner[]> {
    return this.http.get<Data>(this.getURL('owners'))
      .pipe(
        catchError(this.handleError),
        map(res => {
          return res.data;
        })
    );
  }
  fetchDevices(ownerId: string): Observable<Device[]> {
    return this.http.get<Data>(this.getURL('devices/' + ownerId))
      .pipe(
        catchError(this.handleError),
        map(res => {
          return res.data;
        })
    );
  }
  fetchSensors(deviceId: string): Observable<Device[]> {
    return this.http.get<Data>(this.getURL('sensors/' + deviceId))
      .pipe(
        catchError(this.handleError),
        map(res => {
          return res.data;
        })
    );
  }
  fetchRegions(): Observable<Region[]> {
    return this.http.get<Data>(this.getURL('regions'))
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
    if (filter && filter.locations && filter.locations.type) {
      delete filter.locations.type; // TODO: create object in location.component
    }
    console.log(JSON.stringify(filter));
    if (!!filter.sensors && !!filter.sensors.length && !!filter.time && !!filter.locations) {
      this.http.post<Data>(this.getURL('data'), filter)
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
        d.map((data: RawData) => {
          data.measured = format(new Date(data.measured), 'dd.MM.yyyy HH:mm:ss'); // TODO: date/time format should be specified according app localization
          return data;
        });
        this.sendMapData(d);
      });
    } else {
      this.sendMapData([]);
    }
  }
}
