import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { FilterModel } from 'src/app/model/filter-model';
import { Region } from 'src/app/model/region';
import { Constants } from 'src/app/shared/constants';
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
  defaultLabel = '';
  static label: string;
  subscription;
  stayOpened = Constants.STAY_OPEN;
  regionIsOpen;
  locationIsSelected;
  clickedOptionInd = 0;
  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel, private router: Router) { }

  ngOnInit(): void {
    LocationComponent.label = this.defaultLabel;
    this.filterModel.locationFilterChangedBus.next(null); //to show default label on filter-info component

    this.lastItemValue = this.locationList[this.locationList.length -1].value;

    this.dataStorageService.fetchRegions().subscribe((data: Region[]) => {
      this.regionList = data;
    });  

    this.locationForm = new FormGroup({
      selectedDevices: new FormControl(),
      selectedRegion:  new FormControl()
    })

    this.locationForm.valueChanges.subscribe(() => {
      LocationComponent.label = this.makeLabel();
      if(!!this.locationForm.value.selectedRegion) {
        console.log("region name:", this.locationForm.value);
        this.subscription?.unsubscribe();
        this.filterModel.setLocations({name : this.locationForm.value.selectedRegion});
        this.dataStorageService.locationsSelectorBus.next(this.filterModel.locations);
        //this.filterModel.locations = {name : this.locationForm.value.selectedRegion};
      } else {
        this.regionOnChange();
        if (this.locationForm.controls.selectedDevices.value === '1'){
          this.filterModel.setLocations({devices : [1]}); //mock
          this.dataStorageService.locationsSelectorBus.next(this.filterModel.locations);
          //this.filterModel.locations = {devices : [1]}; //mock
        } else if (this.locationForm.controls.selectedDevices.value === '2'){
          this.filterModel.setLocations({ polygon: [] }); //mock
          this.dataStorageService.locationsSelectorBus.next(this.filterModel.locations);
          //this.filterModel.locations = "Polygon"; //mock
        } else if (this.locationForm.controls.selectedDevices.value === '3'){
          this.filterModel.setLocations({ circle: {} }); //mock
          this.dataStorageService.locationsSelectorBus.next(this.filterModel.locations);
          //this.filterModel.locations = "Circle"; //mock
        } else {
          this.filterModel.setLocations(null);
          this.dataStorageService.locationsSelectorBus.next(this.filterModel.locations);
          //this.filterModel.locations = null;
        }        
      }
    });
    this.locationForm.controls.selectedDevices.setValue('1'); //mock My devices
    this.dataStorageService.usubscribeBroadcastBus.subscribe(v => { //prevents drawing feaures (dots) outside poligon
      if(Constants.UNSUB_SRC_LOCACTION_COMPONENT !== v) {
        this.subscription?.unsubscribe();
      }
    });
    this.dataStorageService.allMenusClosedBus.subscribe(b => {
      if(Constants.LOCATION_MENU_LAST_CLOSED === b) {
          if([0, 3].indexOf(this.clickedOptionInd) !== -1) { //My devices, region
            this.subscription = this.dataStorageService.fetchData(this.filterModel);
          } else {
            this.subscription?.unsubscribe();
            this.dataStorageService.usubscribeBroadcastBus.next(Constants.UNSUB_SRC_LOCACTION_COMPONENT);
          }
       }
    });

  }

  makeLabel(): string {
    let result = this.locationList.filter((v) => {
      return v.value === this.locationForm.value.selectedDevices}).map((v, i) => {
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
      this.locationForm.controls.selectedDevices.setValue(lastRadioBtnValue, { emitEvent: false });
    }
    if (!((this.locationForm.value.selectedDevices == "2") || (this.locationForm.value.selectedDevices == "3"))) {
      this.subscription = this.dataStorageService.fetchData(this.filterModel);
      this.dataStorageService.usubscribeBroadcastBus.next(Constants.UNSUB_SRC_LOCACTION_COMPONENT);
    }
    if(this.locationForm.value.selectedDevices == "2" || this.locationForm.value.selectedDevices == "3") {
      this.router.navigate(['/map']);
    }
  }

  regionOnChange(): void {
    const region = this.regionList?.filter((v) => v.id === this.locationForm.value.selectedRegion);
    console.log("location.component region:", region);
    //MapComponent.deleteMap();
    //this.dataStorageService.sendLocationData(MapComponent.regionToGeoJSON(region));
    this.dataStorageService.sendLocationData(region);
    this.regionIsOpen = false;
  }
  setRegionIsOpen(open: boolean) {
    this.regionIsOpen = open;
  }
  shouldStayOpen(): boolean {
    return this.regionIsOpen;
  }
  locationSelected(): boolean {
    return this.locationIsSelected;
  }
  setLocationSelected(e:number) {
    if(e !== -1) {
      this.clickedOptionInd = e;
    }
    if(["0","1","2",].indexOf(e+'') !== -1) {
      this.locationIsSelected = true;
    } else {
      this.locationIsSelected = false;
    }
  }
}
