import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {SalePayment} from 'src/app/modules/pos/models/sale-payment';
import {SALE_PAYMENT_TYPE} from 'src/app/modules/pos/models/sale-payment-type.enum';

@Component({
  selector: 'lpdv-sale-payment',
  templateUrl: './sale-payment.component.html',
  styleUrls: ['./sale-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalePaymentComponent implements OnInit {

  /** Se o usuário pode apagar pagamentos ou não. */
  @Input() canDelete: boolean;

  /** O lançamento exibido no componente */
  @Input() payment: SalePayment;

  /** Evento emitido ao clicar no botão excluir */
  @Output() delete = new EventEmitter<void>();

  get paymentType() {

    if (this.payment.type === SALE_PAYMENT_TYPE.CASH) {

      return 'Dinheiro + Cheque';

    } else if (this.payment.type === SALE_PAYMENT_TYPE.CREDIT) {

      return 'Cartão de crédito';

    } else if (this.payment.type === SALE_PAYMENT_TYPE.DEBIT) {

      return 'Cartão de débito';

    } else if (this.payment.type === SALE_PAYMENT_TYPE.OTHERS) {

      return 'Outros';

    }

  }

  constructor() {
  }

  ngOnInit(): void {
  }

}
