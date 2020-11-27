import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class FilterModel {
  locations: any = null;
  sensors: string[] = null;
  time: any = null;
  order: string[];
  limit: number;
  
  constructor() {}
  
  setLocations = (value: any) => {
    this.locations = value;
  }
}