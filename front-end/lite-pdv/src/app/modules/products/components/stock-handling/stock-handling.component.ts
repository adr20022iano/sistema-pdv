import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {StockHandling} from '../../models/stock-handling';
import {PRODUCT_HANDLING_TYPE} from '../../models/product-handling-type.enum';

@Component({
  selector: 'lpdv-stock-handling',
  templateUrl: './stock-handling.component.html',
  styleUrls: ['./stock-handling.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockHandlingComponent implements OnInit {

  /** A movimentação que será exibida no componente */
  @Input() stockHandling: StockHandling;

  /** A unidade do produto que será exibida na quantidade da movimentação */
  @Input() productUnit: string;

  /** Evento emitido ao clicar no botão excluir */
  @Output() delete = new EventEmitter<void>();

  /** Se o usuário atual do sistema é um administrador */
  @Input() admin: boolean;

  @HostBinding('class.stock-entry')
  get isEntryHandling() {
    return this.stockHandling.type === PRODUCT_HANDLING_TYPE.ENTRY && this.admin;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
