import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, concatMap, delay, map, shareReplay } from 'rxjs/operators';
import { MessageColor, MessageService } from './message.service';
import { BehaviorSubject, EMPTY, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import { Owner } from 'src/app/model/owner';
import { Device } from 'src/app/model/device';
import { Region } from 'src/app/model/region';
import { FilterModel } from 'src/app/model/filter-model';
import { RawData } from 'src/app/model/raw-data';
import { Data } from '@angular/router';
import { Constants } from '../../shared/constants';
import { GeoJSONFeature } from 'src/app/model/geo-json-feature';
import { GeoJSONGeometry } from 'src/app/model/geo-json-geometry';
import { RowNode } from 'ag-grid-community';
import { AuthService } from 'src/app/component/auth/auth.service';
import { User } from 'src/app/component/auth/user.model';

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
  loadingStatusBus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  highlightFeaturesBus: BehaviorSubject<GeoJSONGeometry[]> = new BehaviorSubject<GeoJSONGeometry[]>([]);
  locationsSelectorBus: BehaviorSubject<any> = new BehaviorSubject([]); //to redraw polygon or circle or... when returning to map
  userDevicesBus: BehaviorSubject<any> = new BehaviorSubject([]);
  deviceSensorsBus: BehaviorSubject<any> = new BehaviorSubject([]);
  newUserBus: BehaviorSubject<any> = new BehaviorSubject([]);
  editUserBus: BehaviorSubject<any> = new BehaviorSubject([]);
  newDeviceBus: BehaviorSubject<any> = new BehaviorSubject([]);
  editDeviceBus: BehaviorSubject<any> = new BehaviorSubject([]);
  presetChangedBus: Subject<any> = new Subject<any>();

  deviceTypesObervable: Promise<any[]>;
  firmwaresObervable: Promise<any[]>;
  configurationsObervable: Promise<any[]>;

  usubscribeBroadcastBus: Subject<any> = new Subject<any>();
  
  allMenusClosedBus: BehaviorSubject<string> = new BehaviorSubject<string>('');

  fetchDataSubscription: Subscription;

  constructor(private http: HttpClient, private messageService: MessageService, auth: AuthService) {
    console.log('DataStorageService' + (++DataStorageService.i));
    //logout
    auth.loginBus.subscribe((user: User) => {
      if(!user) { //logout user is null after logout
        this.userDevicesBus.next([]);
      }
    });
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
    if(ownerId) {
      this.http.get<Data>(this.getURL('devices/' + ownerId))
        .pipe(
          catchError(this.handleError),
          map(res => res.data)
        ).subscribe(d => {
          this.userDevicesBus.next(d);
      });
    } else {
      this.userDevicesBus.next([]);
    }
  }

  fetchSensors(filterModel: FilterModel){
    let filter: any = {}; //can't user FilterModel while it has _ in property names
    let subs = [];;
    filter.sensors = filterModel.sensors
    filter.time = filterModel.time;
    filter.locations = filterModel.locations;
    filter.order = filterModel.order;

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
    this.fetchDataSubscription?.unsubscribe();
    this.fetchDataSubscription = this.unusbscribeAndfetchData(filterModel);
    return this.fetchDataSubscription
  }
  unusbscribeAndfetchData(filterModel: FilterModel): Subscription {
    let availableData: RawData[] = [];
    let filter: any = {};
    let subs = [];;
    filter.sensors = filterModel.sensors
    filter.time = filterModel.time;
    filter.locations = filterModel.locations;
    filter.order = ["measured"];
    this.sendPageOfData([]);
    this.sendAvailableData([]);     
    if (!!filter.sensors && !!filter.sensors.length && !!filter.time && !!filter.locations &&
        ((filter.locations.circle && filter.locations.circle.radius) ||
        (filter.locations.polygon && filter.locations.polygon.length) ||
        (filter.locations.devices && filter.locations.devices.length) ||
        (filter.locations.name))) {
        console.log("FETCH:\n" + JSON.stringify(filter));
          //RawDataComponent.clearRawData();
        this.sendLoadingStatus(true);
        let res = this.fetchPages(filter, 1, availableData).subscribe((p: RawData[]) => {
          // this.sendPageOfData(p);
          // availableData = availableData.concat(p);
          // this.sendAvailableData(availableData);
          this.sendLoadingStatus(false);
        })
    
        return res;
    } else {
      console.log("NOFETCH:\n" + JSON.stringify(filter));
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
          if(res.error.indexOf("duplicate key") != -1) {
            this.messageService.showErrorMessage("Already exists.");
          } else {
            this.messageService.showErrorMessage(res.error);
          }
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        } else {
          this.messageService.showMessage("Created.", MessageColor.Green);
        }
        return res.data;
      })
    ).subscribe(d => {
      if(!!d) {
        this.newUserBus.next(d);
      }
    });
  }
  setUsersEnabled(userList: RowNode[], enableUser: boolean){
    let params: any = {};
    params.ids = []
    userList.forEach((v: RowNode) => {
      v.data.enabled = enableUser;
      params.ids.push({id: v.data.id});
    });
    params.values = {enabled: enableUser};
    this.http.request('put', this.getURL('owners/full'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((res: any) => {
        let rows = [];
        if (!!res.error) {
          this.messageService.showErrorMessage(res.error);
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        } else {
          res.data.forEach((v:any )=> {
            v.rowChecked = true; //restoring row's checkbox state
            rows.push(v);
          });
            this.messageService.showMessage("Done.", MessageColor.Green);
        }
        return rows;
      })
    ).subscribe((d: any[]) => {
      if(!!d) {
        this.editUserBus.next(d);
      }
    });
  }
  editUser(user: RowNode, password: string){
    let params: any = {};
    params.ids = []
    params.ids.push({id: user.data.id});
    let newData: any = {};
    newData.name = user.data.name;
    newData.email = user.data.email;
    if(password) {
      newData.password = password;
    }
    params.values = newData;
    this.http.request('put', this.getURL('owners/full'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((res: any) => {
        if (!!res.error) {
          if(res.error.indexOf("duplicate key") != -1) {
            this.messageService.showErrorMessage("Already exists.");
          } else {
            this.messageService.showErrorMessage(res.error);
          }
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        } else {
          this.messageService.showMessage("Updated.", MessageColor.Green);
        }
        return res.data;
      })
    ).subscribe(d => {
      if(!!d) {
        this.editUserBus.next(d);
      }
    });
  }
  newDevice(owner: string, key: string, note: string, type: string, firmware: number, config: string){
    let newDevice: any = {};
    newDevice.owner = owner;
    newDevice.apikey = key;
    newDevice.note = note;
    newDevice.type = type + "";
    newDevice.firmware = firmware;
    newDevice.configuration = config;
    newDevice.public = true;

    this.http.post<Data>(this.getURL('devices/full'), newDevice)
    .pipe(
      catchError(this.handleError),
      map(res => {
        if (!!res.error) {
          if(res.error.indexOf("duplicate key") != -1) {
            this.messageService.showErrorMessage("Already exists.");
          } else {
            this.messageService.showErrorMessage(res.error);
          }
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        } else {
          this.messageService.showMessage("Created.", MessageColor.Green);
        }
        return res.data;
      })
    ).subscribe(d => {
      if(!!d) {
        this.newDeviceBus.next(d);
      }
    });
  }
  editDevice(deviceId: string, type: string, firmware: string, config: string, apiKey: string, note: string, isPublic: boolean){
    let params: any = {};
    params.ids = []
    params.ids.push({id: deviceId});
    let newData: any = {};
    //newData.devicetype = type;
    newData.firmware = firmware;
    newData.apikey = apiKey;
    newData.note = note;
    //params.config = config;
    newData.public = isPublic;
    params.values = newData;

    this.http.request('put', this.getURL('devices/full'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((res: any) => {
        if (!!res.error) {
          if(res.error.indexOf("duplicate key") != -1) {
            this.messageService.showErrorMessage("Already exists.");
          } else {
            this.messageService.showErrorMessage(res.error);
          }
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        } else {
          this.messageService.showMessage("Updated.", MessageColor.Green);
        }
        return res.data;
      })
    ).subscribe(d => {
      if(!!d) {
        this.editDeviceBus.next(d);
      }
    });
  }
  setDevicesEnabled(userList: RowNode[], enableUser: boolean){
    let params: any = {};
    params.ids = []
    userList.forEach((v: RowNode) => {
      v.data.enabled = enableUser;
      params.ids.push({id: v.data.id});
    });
    params.values = {enabled: enableUser};
    this.http.request('put', this.getURL('devices/full'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((res: any) => {
        let rows = [];
        if (!!res.error) {
          this.messageService.showErrorMessage(res.error);
        } else if (!res.success) {
          this.messageService.showErrorMessage('Data request failed with no message');
        } else {
          res.data.forEach((v:any )=> {
            v.rowChecked = true; //restoring row's checkbox state
            rows.push(v);
          });
            this.messageService.showMessage("Done.", MessageColor.Green);
        }
        return rows;
      })
    ).subscribe((d: any[]) => {
      if(!!d) {
        this.editDeviceBus.next(d);
      }
    });
  }
  fetchDeviceTypes(): Promise<any[]> {
    if(!this.deviceTypesObervable) {
      this.deviceTypesObervable = this.http.get<Data>(this.getURL('devicetypes/'))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
      ).toPromise();
    }
    return this.deviceTypesObervable;
  }
  fetchFirmwares(): Promise<any[]> {
    if(!this.firmwaresObervable) {
      this.firmwaresObervable = this.http.get<Data>(this.getURL('firmwares/'))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
      ).toPromise();
    }
    return this.firmwaresObervable;
  }
  fetchConfigurations(): Promise<any[]> {
    if(!this.configurationsObervable) {
      this.configurationsObervable = this.http.get<Data>(this.getURL('config/'))
      .pipe(
        catchError(this.handleError),
        map(res => res.data)
      ).toPromise();
    }
    return this.configurationsObervable;
  }
  unsubscribeBroadcast(initiator: string) {
    this.usubscribeBroadcastBus.next(initiator);
  }
  fetchFilter(filterId: string): Promise<any> {
    let params: any = {};
    params.ids = [{id: filterId}];    
    return this.http.request('post', this.getURL('filters/'), {body: params})
    .pipe(
      catchError(this.handleError)
    ).toPromise();
  }
  fetchFilterList(): Promise<any[]> {
    return this.http.get<Data>(this.getURL('filters/'))
    .pipe(
      catchError(this.handleError),
      map((v: any) => {
        if(v.error) {
          throw (v.error);
        }
        return v.data;
      })
    ).toPromise();
  }
  fetchFilterDetail(filterId: string): Promise<any> {
    return  this.http.get<Data>(this.getURL('filter-items/' + filterId))
    .pipe(
      catchError(this.handleError),
      map(res => res.data)
    ).toPromise();
  }
  updateFilterMetaData(name: string, filterId: string, enabled: boolean, action: string, visibility: string, details: any = {}): Observable<any> {
    let params: any = {};
    params.ids = [{id: filterId}];    
    params.values = {name: name, enabled: enabled, action: action, visibility: visibility};
    params.values.sensors = details._sensors;
    params.values.time = details._time;
    params.values.locations = details._locations;

    return this.http.request('put', this.getURL('filters/fast'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((v: any) => {
        if(v.error) {
          throw (v.error);
        }
        return v;
      })
    );
  }
  saveFilterAs(cloneName: string, filterId: string): Observable<any> {
    let params: any = {};
    params = {id: filterId, name: cloneName};    

    return this.http.request('post', this.getURL('filters/copy/full'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((v: any) => {
        if(v.error) {
          throw (v.error);
        }
        return v;
      })
    );
  }
  createFilterSensor(filterId: string, sensorName: string, sensorValue: string, minMax: string): Observable<any> {
    let params: any = {};
    params = {filter: filterId, sensor: sensorName, value: Number.parseFloat(sensorValue), min_max: minMax};    
    return this.http.request('post', this.getURL('filter-items/fast'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((v: any) => {
        if(v.error) {
          throw (v.error);
        }
        return v;
      })
    );
  }
  updateFilterSensor(filterId: string, sensorName: string, sensorValue: string, minMax: string): Observable<any> {
    let params: any = {};
    params.ids = [{filter: filterId, sensor: sensorName, min_max: minMax}];    
    params.values = {value: sensorValue, min_max: minMax};
    return this.http.request('put', this.getURL('filter-items/full'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((v: any) => {
        if(v.error) {
          throw (v.error);
        }
        return v;
      })
    );
  }
  deleteFilterSensor(filterId: string, sensorName: string, minMax: string): Observable<any> {
    let params: any = {};
    params.ids = [{filter: filterId, sensor: sensorName, min_max: minMax}];    
    return this.http.request('delete', this.getURL('filter-items'), {body: params})
    .pipe(
      catchError(this.handleError),
      map((v: any) => {
        if(v.error) {
          throw (v.error);
        }
        return v;
      })
    );
  }

}
