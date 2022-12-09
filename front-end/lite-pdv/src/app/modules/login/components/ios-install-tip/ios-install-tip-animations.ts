import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata,
} from '@angular/animations';

const backDrop = [

  state('enter', style({
    visibility: 'visible',
    'background-color': 'rgba(0, 0, 0, 0.32)'
  })),
  transition('* => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))

];

const bottomDrawer = [

  state('enter', style({transform: 'none'})),
  transition('* => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))

];

export const iosInstallTipAnimations: {
  readonly bottomDrawer: AnimationTriggerMetadata;
  readonly backDrop: AnimationTriggerMetadata;
} = {
  bottomDrawer: trigger('bottomDrawer', bottomDrawer),
  backDrop: trigger('backDrop', backDrop)
};
