import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, map, expand, reduce} from 'rxjs/operators';
import {MessageColor, MessageService} from './message.service';
import {BehaviorSubject, EMPTY, Observable, throwError} from 'rxjs';
import { Owner } from 'src/app/model/owner';
import { Device } from 'src/app/model/device';
import { Region } from 'src/app/model/region';
import { FilterModel } from 'src/app/model/filter-model';
import { RawData } from 'src/app/model/raw-data';
import { Data } from '@angular/router';
import { Constants } from '../../shared/constants';
import { GeoJSONFeature } from 'src/app/model/geo-json-feature';
import { RawDataComponent } from 'src/app/component/raw-data/raw-data.component';

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
  fetchPages(filter: any, start: number, allData: RawData[]): void {
    this.http.post<Data>(this.getURL('data')+'/'+start, filter)
    .pipe(catchError(this.handleError), 
      map(res => {
        if (!!res.error) {
          this.messageService.showMessage(res.error, MessageColor.Red);
        } else if (!res.success) {
          this.messageService.showMessage('Data request failed with no message', MessageColor.Red);
        }
        return res.data;
      })
    ).subscribe((p: RawData[]) => {
      allData = allData.concat(p);
      if (p?.length != 0) {
        this.fetchPages(filter, ++start, allData);
      } else {
        this.sendMapData(allData);
      }
    })
  }
  fetchData(): void {
    let allData: RawData[] = [];
    let filter:any = {};
    filter.sensors = this.filterModel.sensors
    filter.time = this.filterModel.time;
    filter.locations = this.filterModel.locations;
    console.log(JSON.stringify(filter));
    if (!!filter.sensors && !!filter.sensors.length && !!filter.time && !!filter.locations) {
      this.fetchPages(filter, 1, allData);
    } else {
      this.sendMapData([]);
    }
  }
}
