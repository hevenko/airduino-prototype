import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Region } from 'src/app/model/region';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {
  selectedDevices: string;
  selectedRegion: any;
  regionList: Region[];
  
  constructor(private dataStorageService: DataStorageService) { }

  ngOnInit(): void {
    this.dataStorageService.fetchRegions().subscribe((data: Region[]) => {
      this.regionList = data;
    });
  }

  getLabel(): string {
    return '4 locations';
  }
  locationOnChange(e:any) {
    if (!!e.source && !!e.source.radioGroup ) {
      if(e.source.radioGroup._radios.last != e.source.radioGroup.selected) {
        this.selectedRegion = '';
      }
    } else {
      //last radio btn value
      let radioBtnCount = e.currentTarget.childElementCount;
      let lastRadioBtnValue = e.currentTarget.children[radioBtnCount - 1].getElementsByTagName('input')[0].value
      this.selectedDevices = lastRadioBtnValue;
    }
  }
}
