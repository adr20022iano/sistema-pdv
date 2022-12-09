import { HammerGestureConfig } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

declare var Hammer: any;

@Injectable()
export class CustomHammer extends HammerGestureConfig {

  overrides = {
    // I will only use the swap gesture so
    // I will deactivate the others to avoid overlaps
    pan: { enable: true, direction: Hammer.DIRECTION_HORIZONTAL},
    pinch: { enable: false },
    press: { enable: false },
    rotate: { enable: false },
    swipe: { enable: false },
    tap: { enable: false }
  } as any;

}
