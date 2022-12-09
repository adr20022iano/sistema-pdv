import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'lpdv-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportCardComponent implements OnInit {

  @HostBinding('attr.tabIndex') tabIndex = 1;

  /** A label do relatório */
  @Input() label: string;

  /** O ícone exibido no card */
  @Input() icon: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
