import {ChangeDetectionStrategy, Component, HostBinding, HostListener, OnInit, Output, EventEmitter} from '@angular/core';
import {iosInstallTipAnimations} from './ios-install-tip-animations';
import {AnimationEvent} from '@angular/animations';

@Component({
  selector: 'lpdv-fv-ios-install-tip',
  templateUrl: './ios-install-tip.component.html',
  styleUrls: ['./ios-install-tip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [iosInstallTipAnimations.backDrop, iosInstallTipAnimations.bottomDrawer]
})
export class IosInstallTipComponent implements OnInit {

  /** Estado da animação */
  animationState: 'void' | 'enter' | 'leave';

  /** Evento emitido on fim da animação de saída */
  @Output() onLeave = new EventEmitter<void>();

  @HostBinding('@backDrop') get addBackDropAnimation() {
    return 'enter';
  }

  @HostListener('@backDrop.start') itemShown() {
    this.animationState = 'enter';
  }

  @HostListener('click')
  backDropClick() {
    this.animationState = 'leave';
  }

  drawerAniDone(event: AnimationEvent){

    if (event.fromState === 'enter' && event.toState === 'leave') {
      this.onLeave.emit();
    }

  }

  constructor() {
  }

  ngOnInit(): void {
  }

}
