import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { MessageService } from './message.service';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { Owner } from 'src/app/model/owner';
import { Device } from 'src/app/model/device';
import { Region } from 'src/app/model/region';
import { FilterModel } from 'src/app/model/filter-model';
import { RawData } from 'src/app/model/raw-data';
import { Data } from '@angular/router';
import { Constants } from '../../shared/constants';
import { GeoJSONFeature } from 'src/app/model/geo-json-feature';
import { format } from 'date-fns';
import { RawDataComponent } from 'src/app/component/raw-data/raw-data.component';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  serverURL = Constants.SERVER_URL;
  static i = 0;
  //noAccessControlAllowOriginProxy = 'https://thingproxy.freeboard.io/fetch/'; //fix thanks to: https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe/43881141#43881141
  noAccessControlAllowOriginProxy = ''; //no need to use proxy
  pageOfDataBus: BehaviorSubject<RawData[]> = new BehaviorSubject<RawData[]>(null);
  drawDataBus: BehaviorSubject<GeoJSONFeature[]> = new BehaviorSubject<GeoJSONFeature[]>(null);
  loadingStatusBus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,private messageService: MessageService, private filterModel: FilterModel) {
    console.log('DataStorageService' + (++DataStorageService.i));
  }

  getURL = (resource: string): string => this.noAccessControlAllowOriginProxy + this.serverURL + resource;

  sendPageOfData(data: RawData[]): void {
    this.pageOfDataBus.next(data);
  }

  sendLocationData(data: GeoJSONFeature[]): void {
    this.drawDataBus.next(data);
  }

  sendLoadingStatus(loading: boolean): void {
    this.loadingStatusBus.next(loading);
  }

  handleError = (err: HttpErrorResponse) => {
    if (!!err.message) {
      this.messageService.showErrorMessage(err.message);
      return throwError(err.message);
    }
    return throwError(err);
  }

  fetchOwners(): Observable<Owner[]> {
    return this.http.get<Data>(this.getURL('owners'))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
    );
  }

  fetchDevices(ownerId: string): Observable<Device[]> {
    return this.http.get<Data>(this.getURL('devices/' + ownerId))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
    );
  }

  fetchSensors(deviceId: string): Observable<Device[]> {
    return this.http.get<Data>(this.getURL('sensors/' + deviceId))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
    );
  }

  fetchRegions(): Observable<Region[]> {
    return this.http.get<Data>(this.getURL('regions'))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
    );
  }

  fetchPages(filter: any, page: number): Subscription {
    return this.http.post<Data>(this.getURL('data/') + page, filter)
    .pipe(
      catchError(this.handleError),
      map(res => {
        if (!!res.error) {
          this.messageService.showErrorMessage(res.error);
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        }
        return res.data;
      })
    )
    .subscribe((p: RawData[]) => {
      if (p?.length != 0) {
        p?.map((data: RawData) => {
          data.measured = format(new Date(data.measured), 'dd.MM.yyyy HH:mm:ss'); // TODO: date/time format should be specified according app localization
          return data;
        });
        this.sendPageOfData(p);
        this.fetchPages(filter, ++page);
      } else {
       this.sendLoadingStatus(false);
      }
    })
  }
  fetchData(): Subscription {
    let allData: RawData[] = [];
    let filter: any = {};
    filter.sensors = this.filterModel.sensors
    filter.time = this.filterModel.time;
    filter.locations = this.filterModel.locations;
    //console.log(JSON.stringify(filter));
    if (!!filter.sensors && !!filter.sensors.length && !!filter.time && !!filter.locations &&
        ((filter.locations.circle && filter.locations.circle.radius) ||
        (filter.locations.polygon && filter.locations.polygon.length) ||
        (filter.locations.devices && filter.locations.devices.length) ||
        (filter.locations.name))) {
          //RawDataComponent.clearRawData();
        this.sendLoadingStatus(true);
        return this.fetchPages(filter, 1);
    }
  }
}
