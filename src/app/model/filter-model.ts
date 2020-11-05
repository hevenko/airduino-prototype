import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class FilterModel {
  public locationsSubject: BehaviorSubject<any> = new BehaviorSubject([]);

  locations: any = null;
  sensors: string[] = null;
  time: any = null;
  
  constructor() {}
  
  setLocations = (value: any) => {
    this.locations = value;
    this.locationsSubject.next(this.locations);
  }
}