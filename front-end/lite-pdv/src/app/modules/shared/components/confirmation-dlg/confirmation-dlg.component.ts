import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {DC_DIALOG_DATA} from '@devap-br/devap-components/dialog';
import {ConfirmationDlgConfig} from './confirmation-dlg-config';

@Component({
  selector: 'lpdv-confirmation-dlg',
  templateUrl: './confirmation-dlg.component.html',
  styleUrls: ['./confirmation-dlg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDlgComponent implements OnInit {

  constructor(@Inject(DC_DIALOG_DATA) public config: ConfirmationDlgConfig) {

  }

  ngOnInit(): void {

  }

}
