import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class FilterModel {
  locations: any = null;
  private _sensors: string[] = null;
  time: any = null;
  order: string[];
  limit: number;
  sensorFilterChangedBus: BehaviorSubject<string[]> = new BehaviorSubject([]);

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
}