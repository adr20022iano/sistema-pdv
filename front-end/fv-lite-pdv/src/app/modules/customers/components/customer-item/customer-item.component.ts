import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Customer} from '../../models/customer';

@Component({
  selector: 'lpdv-fv-customer-item',
  templateUrl: './customer-item.component.html',
  styleUrls: ['./customer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerItemComponent {

  /** O cliente exibido no item */
  @Input() customer: Customer;

  /** Evento emitido ao clicar no botão editar */
  @Output() edit = new EventEmitter<void>();

  /** Evento emitido ao clicar no botão de nova venda */
  @Output() newSale = new EventEmitter<void>();

  constructor() {
  }

  /**
   * Emite o clique do botão de nova venda para o cliente
   * @param event Evento de clique do mouse
   */
  emitNewSale(event: MouseEvent) {

    if (this.customer.blockedSale) {
      event.preventDefault();
      return;
    }

    this.newSale.emit();

  }

}
