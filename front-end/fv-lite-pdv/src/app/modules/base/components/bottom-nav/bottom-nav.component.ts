import {Component, OnInit, ChangeDetectionStrategy, Input, HostBinding} from '@angular/core';

@Component({
  selector: 'lpdv-fv-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomNavComponent implements OnInit {

  /** Se a plataforma atual é IOS */
  @Input() isIOS: boolean;

  @HostBinding('class.ios-platform')
  get IOS() {
    return this.isIOS;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
