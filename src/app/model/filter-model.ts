import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class FilterModel {
  private _locations: any = null;
  private _sensors: string[] = null;
  timeFilterType: string;
  private _time: any = null;
  order: string[];
  limit: number;
  sensorFilterChangedBus: BehaviorSubject<string[]> = new BehaviorSubject([]);
  timeFiterChangedBus: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  locationFilterChangedBus: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {}
  
  setLocations = (value: any) => {
    this.locations = value;
  }
  isFilterSet(): boolean {
    return !!this.locations && !!this._sensors && !!this._sensors.length && !!this.time;
  }
  
  public set sensors(s: string[]) {
    this._sensors = s;
    this.sensorFilterChangedBus.next(s);
  }
  public get sensors(): string[] {
    return this._sensors;
  }

  public set time(t: any) {
    this._time = t;
    this.timeFiterChangedBus.next(t);
  }
  public get time(): any {
    return this._time;
  }

  public set locations(l: any) {
    this._locations = l;
    this.locationFilterChangedBus.next(l);
  }
  public get locations() {
    return this._locations;
  }
}