import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable()
export class FilterModel {
  locations: any = null;
  sensors: string[] = null;
  time: any = null;
  
  constructor() {}
}