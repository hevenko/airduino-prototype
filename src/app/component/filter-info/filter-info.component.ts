import { Component, OnInit } from '@angular/core';
import { FilterModel } from 'src/app/model/filter-model';
import { LocationComponent } from '../filter/location-filter/location.component';
import { SensorComponent } from '../filter/sensor-filter/sensor.component';
import { TimeComponent } from '../filter/time-filter/time.component';

@Component({
  selector: 'app-filter-info',
  templateUrl: './filter-info.component.html',
  styleUrls: ['./filter-info.component.css']
})
export class FilterInfoComponent implements OnInit {
  label: any[] = [];

  constructor(private filterModel: FilterModel) { }

  ngOnInit(): void {
    this.filterModel.timeFiterChangedBus.subscribe(v => {
      this.label[0] = TimeComponent.label;
    });

    this.filterModel.sensorFilterChangedBus.subscribe(v => {
      this.label[1] = SensorComponent.label;
    });

    this.filterModel.locationFilterChangedBus.subscribe(v => {
      this.label[2] = LocationComponent.label
    });
  }
}
