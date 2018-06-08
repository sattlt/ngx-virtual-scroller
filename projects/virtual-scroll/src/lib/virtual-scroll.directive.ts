import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[ngxVirtualScroll]'
})
export class VirtualScrollDirective {

  constructor(
    element: ElementRef
  ) {
    console.log('virtual scroll', element);
   }

}
