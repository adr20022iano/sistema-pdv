import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Customer} from '../../models/customer';

@Component({
  selector: 'lpdv-customer-item',
  templateUrl: './customer-item.component.html',
  styleUrls: ['./customer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerItemComponent implements OnInit{

  /** O cliente exibido no item */
  @Input() customer: Customer;

  /** Evento emitido ao clicar no botão editar */
  @Output() edit = new EventEmitter<void>();

  /** Evento emitido ao clicar no botão de nova venda */
  @Output() newSale = new EventEmitter<void>();

  /** O endereço do cliente */
  customerAddress: string;

  constructor() {

  }

  ngOnInit() {

    const address = this.customer.address ? this.customer.address : '';
    const addressNumber = this.customer.number ? ', '.concat(this.customer.number) : '';
    const complement = this.customer.complement ? ', '.concat(this.customer.complement) : '';
    const district = this.customer.district ? ', '.concat(this.customer.district) : '';
    this.customerAddress = [address, addressNumber, complement, district].join('');

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
