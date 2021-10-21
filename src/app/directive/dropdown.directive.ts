import { KeyValue } from '@angular/common';
import {Directive, ElementRef, HostBinding, HostListener, Renderer2} from '@angular/core';
import { Subscription } from 'rxjs';
import { FilterModel } from '../model/filter-model';
import { Constants } from '../shared/constants';
import { DataStorageService } from '../shared/service/data-storage.service';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  leftPos = 0;
  @HostBinding('class.open') isOpen = false;
  @HostBinding('class.pull-left') get pullLeft() {
    if (this.menuId === 'timeMenu') {
      let result = false;
      let currentPos = this.elRef.nativeElement.offsetLeft;
      if (this.leftPos !== currentPos) {
        console.log(this.elRef.nativeElement.offsetLeft)
        this.leftPos = currentPos;
      }
      result = this.leftPos <= 200;
      return result;  
    }
  };
  @HostBinding('class.pull-right') get pullRight() {
    if (this.menuId === 'timeMenu') {
      let result = this.leftPos > 200;
      return result;  
    }
  };
  menuId: any;
  
  static fetchDataTriggerList = ['locationMenu','sensorMenu','timeMenu'];
  static fetchDataState: Map<string, string> = new Map();
  openMenuCounter = 0;

  constructor(private elRef: ElementRef, private dataStorageService: DataStorageService, private filterModel: FilterModel) { 
    this.menuId = elRef.nativeElement.id;
  }
  //closeMenu flag may be set on clicked item or higher up the DOM
  shouldParentCloseTheMenu(target: any): boolean {
    let result = false;
    if (target.tagName?.toUpperCase().indexOf("APP-") != -1) { //stop if this component root DOM is reached
      result = false;
    } else if (target.classList.contains('closeMenu')) {
      result = true;
    } else {
      result = result || this.shouldParentCloseTheMenu(target.parentNode); // recursive parent search
    }
    return result;
  }

  isMapClicked(target: any): boolean {
    let result = false;
    if (target.tagName?.toUpperCase().indexOf("APP-") != -1) { //stop if this component root DOM is reached
      result = false;
    } else if (target.id === 'map') {
      result = true;
    } else {
      result = result || this.isMapClicked(target.parentNode); // recursive parent search
    }
    return result;
  }
  /**
   * when user is trying to add a region the menu will not close when map is clicked.
   * Clicking on other menus will close location menu.
   * @param event 
   * @returns 
   */
  newRegionIsBeeingEntered(event: any) {
    let result = this.menuId === 'locationMenu' 
    
    && this.elRef.nativeElement.getElementsByClassName('region-name-input-id')[0].value !== '' // input contanins new region name
    && this.isMapClicked(event.target) // user is clicking on the map to make polygon of new region
    && (DropdownDirective.fetchDataState.get('locationMenu') === 'opened' // after opening locations menu it's state is 'opened' but click on map will change state to 'same' and a map click must not change it's state (see code below)
      || DropdownDirective.fetchDataState.get('locationMenu') === 'same');
    
    return result;
  }
  @HostListener('document:click', ['$event']) toggleOpen(event: any) {
      let isOpenNewValue = false;

      if (this.elRef.nativeElement.classList.contains(Constants.STAY_OPEN)) { // stayOpen flag is set on this component
        isOpenNewValue = true;
      } else if (this.elRef.nativeElement.contains(event.target)) { // clicked inside of this component
        // clicked on component header
        if (this.elRef.nativeElement.firstChild.contains(event.target) || this.elRef.nativeElement.firstChild == event.target) {
          isOpenNewValue = !this.isOpen;
        } else if (this.shouldParentCloseTheMenu(event.target)) { // click on item should close the menu
          isOpenNewValue = false;
        } else {
          isOpenNewValue = true; // click was inside of this component
        }
      } else if (this.newRegionIsBeeingEntered(event)) {
          isOpenNewValue = this.isOpen; // while user is entering new region, clicking on map must not change location menu open state (if open it should remain so, it will be closed if other menu was clicked)
      } else {
        isOpenNewValue = false; // click was outside of this component
      }
      if (DropdownDirective.fetchDataTriggerList.indexOf(this.menuId) !== -1) {
        if(this.isOpen !== isOpenNewValue) {// prevents getting data on any click
          if(isOpenNewValue) {
            DropdownDirective.fetchDataState.set(this.menuId, 'opened'); 
          } else {
            DropdownDirective.fetchDataState.set(this.menuId, 'closed'); 
          }
        } else {
          DropdownDirective.fetchDataState.set(this.menuId, 'same'); 
        }
        /* outputs open/closed (changed) state of menus
        console.log(this.menuId +"\ntimeMenu:"+ DropdownDirective.fetchDataState.get('timeMenu')+"\n"+
        "sensorMenu:"+ DropdownDirective.fetchDataState.get('sensorMenu')+"\n"+
        "locationMenu:"+ DropdownDirective.fetchDataState.get('locationMenu')+"\n");
        //*/
        let allMenusClosed = false;
        if('locationMenu' === this.menuId) { // locationMenu appDropdown directive instance is always last to process a click so it knows if a menu is opened
          let fetchDataTrigger = [];
          let sequence = [Constants.TIME_MENU_LAST_CLOSED, Constants.SENSOR_MENU_LAST_CLOSED, Constants.LOCATION_MENU_LAST_CLOSED];
          DropdownDirective.fetchDataState.forEach((k:string, v: string) => {
            fetchDataTrigger.push(k);
          });
          //get data only if open state changed on a menu (at least one menu is not 'same')
          let indOfClosedMenu = fetchDataTrigger.indexOf('closed');
          let indOfOpenedMenu = fetchDataTrigger.indexOf('opened');
          if(indOfOpenedMenu === -1 && indOfClosedMenu !== -1) { //get data when a menu was closed and no menu has been opened
            console.log('all menus closed');
            allMenusClosed = true;
          }
          if(allMenusClosed && indOfClosedMenu !== -1) {
            this.dataStorageService.allMenusClosedBus.next(sequence[indOfClosedMenu]); //brodcasting last closed menu name
          }
        }

      }
      this.isOpen = isOpenNewValue;
  }
}
