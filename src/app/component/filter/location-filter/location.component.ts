import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterModel } from 'src/app/model/filter-model';
import { Region } from 'src/app/model/region';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { MapComponent } from '../../map/map.component';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {
  selectedDevices: string;
  selectedRegion: any;
  regionList: Region[];
  locationForm: FormGroup = new FormGroup({});
  lastItemValue = '';
  locationList = [
    {value: '1', desc: 'My devices'},
    {value: '2', desc: 'Custom polygon'},
    {value: '3', desc: 'Circular perimeter'},
    {value: '4', desc: 'Region'}
  ];
  defaultLabel = 'Locations (?)';
  
  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { }

  ngOnInit(): void {
    this.lastItemValue = this.locationList[this.locationList.length -1].value;

    this.dataStorageService.fetchRegions().subscribe((data: Region[]) => {
      this.regionList = data;
    });  
    this.locationForm = new FormGroup({
      selectedDevices: new FormControl(),
      selectedRegion:  new FormControl()
    })
    this.locationForm.valueChanges.subscribe(() => {
      if(!!this.locationForm.value.selectedRegion) {
        this.filterModel.setLocations({name : this.locationForm.value.selectedRegion});
        //this.filterModel.locations = {name : this.locationForm.value.selectedRegion};
      } else if (this.locationForm.controls.selectedDevices.value === '1'){
        this.filterModel.setLocations({devices : [1]}); //mock
        //this.filterModel.locations = {devices : [1]}; //mock
      } else if (this.locationForm.controls.selectedDevices.value === '2'){
        this.filterModel.setLocations({ polygon: [] }); //mock
        //this.filterModel.locations = "Polygon"; //mock
      } else if (this.locationForm.controls.selectedDevices.value === '3'){
        this.filterModel.setLocations({ circle: {} }); //mock
        //this.filterModel.locations = "Circle"; //mock
      } else {
        this.filterModel.setLocations(null);
        //this.filterModel.locations = null;
      }
    });
    this.locationForm.controls.selectedDevices.setValue('1'); //mock My devices
  }

  getLabel(): string {
    let result = this.locationList.filter((v) => {
      return v.value === this.locationForm.value.selectedDevices}).map((v, i)=>{
        return !!v ? v.value === this.lastItemValue ? this.locationForm.value.selectedRegion : v.desc : this.defaultLabel})[0];
    return !!result ? result : this.defaultLabel;
  }
  locationOnChange(e:any) {
    if (!!e.source && !!e.source.radioGroup ) {
      if(e.source.radioGroup._radios.last != e.source.radioGroup.selected) {
        this.locationForm.controls.selectedRegion.setValue('');
      }
    } else {
      //region was selected so last radio btn is checked
      let radioBtnCount = e.currentTarget.childElementCount;
      let lastRadioBtnValue = e.currentTarget.children[radioBtnCount - 1].getElementsByTagName('input')[0].value;
      this.locationForm.controls.selectedDevices.setValue(lastRadioBtnValue,{emitEvent: false});
    }
    if (!((this.locationForm.value == "2") || (this.locationForm.value == "3"))) {
      this.dataStorageService.fetchData();
    }
  }
  regionOnChange(): void {
    let l = this.regionList.filter((v)=>{return v.id === this.locationForm.value.selectedRegion});
    //MapComponent.deleteMap();
    this.dataStorageService.sendLocationData(MapComponent.regionToGeoJSON(l));
  }
}
