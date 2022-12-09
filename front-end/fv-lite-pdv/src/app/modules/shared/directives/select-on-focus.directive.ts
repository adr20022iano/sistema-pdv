import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[lpdvSelectOnFocus]'
})
export class SelectOnFocusDirective {

  constructor() {
  }

  @HostListener('focus', ['$event.target'])
  onFocus(input: HTMLInputElement) {
    if (input.value) {
      input.setSelectionRange(0, input.value.length);
    }
  }

}
