import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';

@Component({
  selector: 'lpdv-settings-title',
  templateUrl: './settings-title.component.html',
  styleUrls: ['./settings-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsTitleComponent implements OnInit {

  /** O título exibido no componente */
  @Input() title: string;

  /** O subtítulo exibido no componente */
  @Input() subtitle: string;

  /** O ícone exibido no componente */
  @Input() icon: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
