import {Directive, ElementRef, HostBinding, HostListener, Renderer2} from '@angular/core';
import { Constants } from '../shared/constants';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  @HostBinding('class.open') isOpen = false;

  constructor(private elRef: ElementRef) { }

  @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
      this.isOpen = this.elRef.nativeElement.contains(event.target) || this.elRef.nativeElement.classList.contains(Constants.STAY_OPEN);
  }
}
