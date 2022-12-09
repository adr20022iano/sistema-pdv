import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {CashBookEntry} from '../../models/cash-book-entry';

@Component({
  selector: 'lpdv-cash-book-entry',
  templateUrl: './cash-book-entry.component.html',
  styleUrls: ['./cash-book-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashBookEntryComponent implements OnInit {

  /** O lançamento exibido neste item */
  @Input() entry: CashBookEntry;

  /** Se o usuário pode é administrador ou não */
  @Input() admin: boolean;

  /** Evento emitido quando o botão excluir é clicado */
  @Output() delete = new EventEmitter<void>();

  constructor() {
  }

  @HostBinding('class.is-admin') get isAdmin() {
    return this.admin;
  }

  ngOnInit(): void {
  }

}
