import {Component, OnInit, ChangeDetectionStrategy, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'lpdv-setting-card',
  templateUrl: './setting-card.component.html',
  styleUrls: ['./setting-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingCardComponent implements OnInit {

  @HostBinding('attr.tabIndex') tabIndex = 1;

  /** A label do atalho */
  @Input() label: string;

  /** O ícone exibido no card */
  @Input() icon: string;


  constructor() { }

  ngOnInit(): void {
  }

}
