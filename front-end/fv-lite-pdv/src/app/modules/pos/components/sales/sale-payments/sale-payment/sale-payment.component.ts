import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {SalePayment} from 'src/app/modules/pos/models/sale-payment';
import {SALE_PAYMENT_TYPE} from 'src/app/modules/pos/models/sale-payment-type.enum';

@Component({
  selector: 'lpdv-fv-sale-payment',
  templateUrl: './sale-payment.component.html',
  styleUrls: ['./sale-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalePaymentComponent implements OnInit {

  /** O lançamento exibido no componente */
  @Input() payment: SalePayment;

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

  constructor() { }

  ngOnInit(): void {
  }

}
