import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, concatMap, map } from 'rxjs/operators';
import { MessageColor, MessageService } from './message.service';
import { BehaviorSubject, EMPTY, Observable, of, Subscription, throwError } from 'rxjs';
import { Owner } from 'src/app/model/owner';
import { Device } from 'src/app/model/device';
import { Region } from 'src/app/model/region';
import { FilterModel } from 'src/app/model/filter-model';
import { RawData } from 'src/app/model/raw-data';
import { Data } from '@angular/router';
import { Constants } from '../../shared/constants';
import { GeoJSONFeature } from 'src/app/model/geo-json-feature';
import { GeoJSONGeometry } from 'src/app/model/geo-json-geometry';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  serverURL = Constants.SERVER_URL;
  static i = 0;
  //noAccessControlAllowOriginProxy = 'https://thingproxy.freeboard.io/fetch/'; //fix thanks to: https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe/43881141#43881141
  noAccessControlAllowOriginProxy = ''; //no need to use proxy

  headers = new HttpHeaders({ "Content-type": "text/plain" }); // used in fetchPage to eliminate preflight requests
  pageOfDataBus: BehaviorSubject<RawData[]> = new BehaviorSubject<RawData[]>(null);
  availableDataBus: BehaviorSubject<RawData[]> = new BehaviorSubject<RawData[]>(null);
  drawDataBus: BehaviorSubject<GeoJSONFeature[]> = new BehaviorSubject<GeoJSONFeature[]>(null);
  loadingStatusBus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  highlightFeaturesBus: BehaviorSubject<GeoJSONGeometry[]> = new BehaviorSubject<GeoJSONGeometry[]>([]);
  locationsSelectorBus: BehaviorSubject<any> = new BehaviorSubject([]); //to redraw polygon or circle or... when returning to map
  userDevicesBus: BehaviorSubject<any> = new BehaviorSubject([]);
  deviceSensorsBus: BehaviorSubject<any> = new BehaviorSubject([]);
  newUserBus: BehaviorSubject<any> = new BehaviorSubject([]);
  constructor(private http: HttpClient,private messageService: MessageService) {
    console.log('DataStorageService' + (++DataStorageService.i));
  }

  getURL = (resource: string): string => this.noAccessControlAllowOriginProxy + this.serverURL + resource;

  sendPageOfData(data: RawData[]): void {
    this.pageOfDataBus.next(data);
  }
  sendAvailableData(data: RawData[]): void {
    this.availableDataBus.next(data);
  }

  sendLocationData(data: any): void {
    this.drawDataBus.next(data);
  }

  sendLocationData0(data: GeoJSONFeature[]): void {
    this.drawDataBus.next(data);
  }

  sendLoadingStatus(loading: boolean): void {
    this.loadingStatusBus.next(loading);
  }
  highlightFeatures(features: GeoJSONGeometry[]): void {
    this.highlightFeaturesBus.next(features);
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

  fetchDevices(ownerId: string) {
    this.http.get<Data>(this.getURL('devices/' + ownerId))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
    ).subscribe(d => {
      this.userDevicesBus.next(d);
    });
  }

  fetchSensors(filter: FilterModel){
    this.http.post<Data>(this.getURL('data/'), filter, { headers: this.headers })
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
    ).subscribe(d => {
      this.deviceSensorsBus.next(d);
    });
  }

  fetchRegions(): Observable<Region[]> {
    return this.http.get<Data>(this.getURL('regions'))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
    );
  }

  fetchPages(filter: any, page: number, availableData: RawData[]): Observable<any> {
    return this.http.post<Data>(this.getURL('data/') + page, filter, { headers: this.headers })
    .pipe(
      catchError(this.handleError),
      map(res => {
        if (!!res.error) {
          this.messageService.showErrorMessage(res.error);
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        }
        return res.data;
      }),
      concatMap(((p: RawData[]) => {
        this.sendPageOfData(p);
        availableData = availableData.concat(p);
        this.sendAvailableData(availableData);
         if (p?.length > 0) {
          return this.fetchPages(filter, ++page, availableData);
        } else {
          return of([]);
        }
      }))
    )
  }
  
  fetchData(filterModel: FilterModel): Subscription {
    let availableData: RawData[] = [];
    let filter: any = {};
    let subs = [];;
    filter.sensors = filterModel.sensors
    filter.time = filterModel.time;
    filter.locations = filterModel.locations;
    //console.log(JSON.stringify(filter));
    this.sendPageOfData([]);
    this.sendAvailableData([]);     
    if (!!filter.sensors && !!filter.sensors.length && !!filter.time && !!filter.locations &&
        ((filter.locations.circle && filter.locations.circle.radius) ||
        (filter.locations.polygon && filter.locations.polygon.length) ||
        (filter.locations.devices && filter.locations.devices.length) ||
        (filter.locations.name))) {
          //RawDataComponent.clearRawData();
        this.sendLoadingStatus(true);
        let res = this.fetchPages(filter, 1, availableData).subscribe((p: RawData[]) => {
          // this.sendPageOfData(p);
          // availableData = availableData.concat(p);
          // this.sendAvailableData(availableData);
          this.sendLoadingStatus(false);
        })
    
        return res;
    }
  }
  newUser(userName: string, email: string, password: string){
    let newUser: any = {};
    newUser.name = userName;
    newUser.email = email;
    newUser.password = password;
    this.http.post<Data>(this.getURL('owners/full'), newUser)
    .pipe(
      catchError(this.handleError),
      map(res => {
        if (!!res.error) {
          this.messageService.showErrorMessage(res.error);
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        } else {
          this.messageService.showMessage("Created.", MessageColor.Green);
        }
        return res.data;
      })
    ).subscribe(d => {
      this.newUserBus.next(d);
    });
  }
 
}
