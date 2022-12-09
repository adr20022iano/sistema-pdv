import {Directive, ElementRef, OnInit} from '@angular/core';
import {DcInput} from '@devap-br/devap-components/input';
import {Platform} from '@angular/cdk/platform';

@Directive({
  selector: '[lpdvAutoFocus]'
})
export class AutoFocusDirective implements OnInit {

  private readonly mobile: boolean;

  constructor(private elementRef: ElementRef<DcInput>, private platform: Platform) {
    this.mobile = this.platform.ANDROID || this.platform.IOS;
  }

  ngOnInit() {

    if (!this.mobile) {
      this.elementRef.nativeElement.focus();
    }

  }

}
