import {Directive, ElementRef, HostBinding, HostListener, Renderer2} from '@angular/core';
import { Constants } from '../shared/constants';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  @HostBinding('class.open') isOpen = false;

  constructor(private elRef: ElementRef) { }

  //closeMenu flag may be set on clicked item or higher up the DOM
  shouldParentCloseTheMenu(target: any): boolean {
    let result = false;
    if (target.tagName.toUpperCase().indexOf("APP-") != -1) { //stop if this component root DOM is reached
      result = false;
    } else if (target.classList.contains('closeMenu')) {
      result = true;
    } else {
      result = result || this.shouldParentCloseTheMenu(target.parentNode); // recursive parent search
    }
    return result
  }
  @HostListener('document:click', ['$event']) toggleOpen(event: any) {

      if (this.elRef.nativeElement.classList.contains(Constants.STAY_OPEN)) { // stayOpen flag is set on this component
        this.isOpen = true;
      } else if (this.elRef.nativeElement.contains(event.target)) { // clicked inside of this component
        // clicked on component header
        if (this.elRef.nativeElement.firstChild.contains(event.target) || this.elRef.nativeElement.firstChild == event.target) {
          this.isOpen = !this.isOpen;
        } else if (this.shouldParentCloseTheMenu(event.target)) { // click on item should close the menu
          this.isOpen = false;
        } else {
          this.isOpen = true; // click was inside of this component
        }
      } else {
          this.isOpen = false; // click was outside of this component
      }
  }
}
