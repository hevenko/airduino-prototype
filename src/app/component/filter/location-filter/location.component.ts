import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { FilterModel } from 'src/app/model/filter-model';
import { Region } from 'src/app/model/region';
import { Constants } from 'src/app/shared/constants';
import { FormIntactChecker } from 'src/app/shared/FormIntactChecker';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { MessageService } from 'src/app/shared/service/message.service';
import { AirduinoComponent } from '../../airduino/airduino.component';
import { faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent extends AirduinoComponent implements OnInit {
  faMapMarkedAlt = faMapMarkedAlt;
  selectedDevices: string;
  selectedRegion: any;
  regionList: Region[];
  locationForm: FormGroup = new FormGroup({});
  _formIntactChecker: FormIntactChecker;
  _isIntact: boolean;
  _rs = new ReplaySubject<boolean>();

  lastItemValue = '';
  locationList = [
    { value: '1', desc: 'My devices' },
    { value: '2', desc: 'Custom polygon' },
    { value: '3', desc: 'Circular perimeter' },
    { value: '4', desc: 'Region' }
  ];
  defaultLabel = '';
  static label: string;
  subscription;
  stayOpened = Constants.STAY_OPEN;
  regionIsOpen;
  locationIsSelected;
  clickedOptionInd = 0;
  dialogIsOpen = false;
  @ViewChild('regionNameInput') regionNameInput: ElementRef;

  constructor(public dialog: MatDialog, private dataStorageService: DataStorageService, private filterModel: FilterModel, private router: Router,
    private messageService: MessageService) { 
    super();
  }

  setupFormIntactChecker(): void {
    this.subscribeToPreseting();
    if (this._rs) {
      this._rs.subscribe((isIntact: boolean) => {
        this._isIntact = isIntact;
        if (isIntact) { // form is intact
          this.locationForm.markAsPristine();
        } else { // form is dirty
        }
      })
    }

    this._formIntactChecker = new FormIntactChecker(this.locationForm, this._rs);
    this._formIntactChecker.markIntact();

  }
  get isIntact(): boolean {
    return this._rs ? this._isIntact : this._formIntactChecker.lastIntact;
  };
  fetchRegions(): void {
    this.dataStorageService.fetchRegions().subscribe((data: Region[]) => {
      this.regionList = data;
    });  
  }

  ngOnInit(): void {
    LocationComponent.label = this.defaultLabel;
    this.filterModel.locationFilterChangedBus.next(null); //to show default label on filter-info component

    this.lastItemValue = this.locationList[this.locationList.length - 1].value;

    this.fetchRegions();

    this.locationForm = new FormGroup({
      selectedDevices: new FormControl(),
      selectedRegion: new FormControl()
    })
    this.locationForm.valueChanges.subscribe(() => {
      LocationComponent.label = this.makeLabel();
      if (!!this.locationForm.value.selectedRegion) {
        console.log("region name:", this.locationForm.value);
        this.subscription?.unsubscribe();
        this.filterModel.setLocations({ name: this.locationForm.value.selectedRegion });
        this.dataStorageService.locationsSelectorBus.next(this.filterModel.locations);
        //this.filterModel.locations = {name : this.locationForm.value.selectedRegion};
      } else {
        this.regionOnChange();
        if (this.locationForm.controls.selectedDevices.value === '1') {
          this.filterModel.setLocations({ devices: [1] }); //mock
          this.dataStorageService.locationsSelectorBus.next(this.filterModel.locations);
          //this.filterModel.locations = {devices : [1]}; //mock
        } else if (this.locationForm.controls.selectedDevices.value === '2') {
          this.filterModel.setLocations({ polygon: [] }); //mock
          this.dataStorageService.locationsSelectorBus.next(this.filterModel.locations);
          //this.filterModel.locations = "Polygon"; //mock
        } else if (this.locationForm.controls.selectedDevices.value === '3') {
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
      if (Constants.UNSUB_SRC_LOCACTION_COMPONENT !== v) {
        this.subscription?.unsubscribe();
      }
    });
    this.dataStorageService.allMenusClosedBus.subscribe(b => {
      if (Constants.LOCATION_MENU_LAST_CLOSED === b && !this.isIntact) {
        if ([0, 3].indexOf(this.clickedOptionInd) !== -1) { //My devices, region
          this.subscription = this.dataStorageService.fetchData(this.filterModel);
          this._formIntactChecker.markIntact();
        } else {
          this.subscription?.unsubscribe();
          this.dataStorageService.usubscribeBroadcastBus.next(Constants.UNSUB_SRC_LOCACTION_COMPONENT);
        }
      }
    });
    this.setupFormIntactChecker();

  }

  makeLabel(): string {
    let selectedDevice = this.locationList.filter((v) => { return v.value === this.locationForm.value.selectedDevices });
    let label = selectedDevice.map((v, i) => { return !!v ? v.value === this.lastItemValue ? this.getSelectedRegion()?.name : v.desc : this.defaultLabel })
    let result = label[0];
    return !!result ? result : this.defaultLabel;
  }

  locationOnChange(e: any = null) {
    if (this.locationForm.controls.selectedDevices.value !== '4') { // deselecting region
      this.locationForm.controls.selectedRegion.setValue('');
    }
    if (!((this.locationForm.value.selectedDevices == "2") || (this.locationForm.value.selectedDevices == "3"))) {
      this.subscription = this.dataStorageService.fetchData(this.filterModel);
      this.dataStorageService.usubscribeBroadcastBus.next(Constants.UNSUB_SRC_LOCACTION_COMPONENT);
    }
    if (e && (this.locationForm.value.selectedDevices == "2" || this.locationForm.value.selectedDevices == "3")) { // if there is e (event) there was user interaction
      this.router.navigate(['/map']);
    }
  }
  getSelectedRegion(): any {
    let list = this.regionList?.filter((v) => (v.id + '') === this.locationForm.value.selectedRegion);
    let result =  list ? list[0] : list;
    return result;
  }
  regionOnChange(): void {
    let region = this.getSelectedRegion();
    console.log("location.component region:", region);
    //MapComponent.deleteMap();
    //this.dataStorageService.sendLocationData(MapComponent.regionToGeoJSON(region));
    this.dataStorageService.sendLocationData(region);
    this.regionIsOpen = false;
  }
  selectedRegionChanged(): void {
    this.regionOnChange();
    (this.locationForm.get('selectedDevices') as FormControl).setValue('4', {emitEvent: false});
  }
  setRegionIsOpen(open: boolean) {
    this.regionIsOpen = open;
  }
  shouldStayOpen(): boolean {
    return this.regionIsOpen || this.dialogIsOpen;
  }
  locationSelected(): boolean {
    return this.locationIsSelected;
  }
  setLocationSelected(ind: number) {
    let allowSelectRadio = true;
    if (ind !== -1) {
      this.clickedOptionInd = ind;
    }
    if (["0", "1", "2",].indexOf(ind + '') !== -1) {
      this.locationIsSelected = true;
    } else {
      this.locationIsSelected = false;
      allowSelectRadio = false;
    }
    return allowSelectRadio;
  }
  subscribeToPreseting() {
    this.dataStorageService.presetChangedBus.subscribe(v => {
      if (v.locations_type === 'name') {
        this.locationForm.controls['selectedDevices'].setValue('4');
        this.locationForm.controls['selectedRegion'].setValue(v.locations.name + '');
        this.regionOnChange();
      } else if (v.locations_type === 'interval') { 
        this.locationForm.controls['selectedDevices'].setValue('1'); // why is it the same as devices
        this.locationOnChange();
      } else if (v.locations_type === 'circle') {
        this.locationForm.controls['selectedDevices'].setValue('3');
        this.locationOnChange();
        let geo = {gtype : 'Circle', radius: v.locations.circle.radius, center: v.locations.circle.center};
        this.dataStorageService.sendLocationData(geo);
        const center = v.locations.circle.center;
        const radius = v.locations.circle.radius;
        const circle = { circle: { center, radius }}; 
        this.filterModel.locations = circle;
      } else if (v.locations_type === 'devices') {
        this.locationForm.controls['selectedDevices'].setValue('1');
        this.locationOnChange();
      } else if (v.locations_type === 'polygon') {
        this.locationForm.controls['selectedDevices'].setValue('2');
        this.locationOnChange();
        let geo = {gtype : 'Polygon', coordinates: [v.locations.polygon]};
        this.dataStorageService.sendLocationData(geo);
        const polygon = { polygon: v.locations.polygon };
        this.filterModel.locations = polygon;
        }
    });
  }
  setDialogIsOpen(isOpen: boolean) {
    this.dialogIsOpen = isOpen;
  }
  enableSaveNewRegion(): boolean {
    return this.regionNameInput?.nativeElement?.value?.length > 2;
  }
  saveNewRegion(regionName: string): void {
    if (this.filterModel.locations.polygon?.length) {
      this.dataStorageService.saveNewRegion(this.filterModel, regionName).subscribe((v) => {
        let message = v.success ? Constants.MSG_REGION_CREATED : Constants.MSG_REGION_SAVE_FAILED;
        this.showInfoMessage(this.dialog, message).afterClosed().subscribe(result => {
          this.setDialogIsOpen(false);
        });
        this.setDialogIsOpen(true);
          this.fetchRegions();
      }, e => {
        console.error(e)
        this.messageService.showErrorMessage(e);
      });  
    } else {
      this.showInfoMessage(this.dialog, Constants.MSG_NO_REGION).afterClosed().subscribe(result => {
        this.setDialogIsOpen(false);
      });
      this.setDialogIsOpen(true);
    }
  }
  updateRegion(regionName: string, regionId): void {
    if(this.filterModel.locations.polygon?.length) {
      this.dataStorageService.updateRegion(this.filterModel, regionName, regionId).subscribe((v) => {
        let message = v.success ? Constants.MSG_REGION_UPDATED : Constants.MSG_REGION_UPDATE_FAILED;
        this.showInfoMessage(this.dialog, message).afterClosed().subscribe(result => {
          this.setDialogIsOpen(false);
        });
        this.setDialogIsOpen(true);
          this.fetchRegions();
      }, e => {
        console.error(e)
        this.messageService.showErrorMessage(e);
      });
    } else {
      this.showInfoMessage(this.dialog, Constants.MSG_NO_REGION).afterClosed().subscribe(result => {
        this.setDialogIsOpen(false);
      });
      this.setDialogIsOpen(true);;
    }
  }
  saveRegionChanges(regionName: string): void {
    let list = this.regionList?.filter((v) => (v.name) === regionName);
    let id = list.length ? list[0].id : null;
    if (id) {
      this.updateRegion(regionName, id);
    } else {
      this.saveNewRegion(regionName);
    }
  }
  selectPolygonRadio(): void {
    if (this.locationForm.get('selectedDevices').value !== '2') {
      this.locationForm.get('selectedDevices').setValue('2');
      this.locationOnChange();  
    }
  }
  regionNameStartEdit(): void {
    this.selectPolygonRadio();
  }
}
