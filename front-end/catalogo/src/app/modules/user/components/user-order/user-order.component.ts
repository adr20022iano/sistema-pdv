import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {CustomerOrder} from '../../../cart/models/customer-order';

@Component({
  selector: 'clpdv-user-order',
  templateUrl: './user-order.component.html',
  styleUrls: ['./user-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserOrderComponent implements OnInit {

  /** Label exibido no status do recebimento/pagamento */
  statusLabel: string;

  /** Classe css usada na label de status do recebimento/pagamento  */
  statusClass: string;

  /** O pedido exibido no componente */
  @Input() order: CustomerOrder;

  constructor() {
  }

  ngOnInit(): void {

    const paidValue = this.order.paidValue;
    const saleValue = this.order.value;

    if (paidValue === 0) {

      // Não recebido/pago
      this.statusClass = 'pending-payment';
      this.statusLabel = 'A pagar';

    } else if (paidValue < saleValue) {

      // Recebido/pago parcialmente
      this.statusClass = 'parcial-payment';
      this.statusLabel = 'Pag. parcial';

    } else if (paidValue === saleValue) {

      // Recebido/pago totalmente
      this.statusClass = 'complete-payment';
      this.statusLabel = 'Pago';

    } else if (paidValue > saleValue) {

      // Recebido/pago acima do valor
      this.statusClass = 'superior-payment';
      this.statusLabel = 'Pag. superior';

    }

  }

}
