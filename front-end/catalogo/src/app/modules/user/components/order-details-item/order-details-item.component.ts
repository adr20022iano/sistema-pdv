import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {CartProduct} from '../../../cart/models/cart-product';

@Component({
  selector: 'clpdv-order-details-item',
  templateUrl: './order-details-item.component.html',
  styleUrls: ['./order-details-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailsItemComponent implements OnInit {

  /** O produto exibido no componente */
  @Input() product: CartProduct;

  /** A url da imagem do produto */
  productImage = '/assets/images/placeholders/product-placeholder-50.png';

  /** O subtotal do item */
  subTotal: number;

  /** Evento emitido ao clicar na opção editar */
  @Output() edit = new EventEmitter<void>();

  constructor() {
  }

  ngOnInit(): void {

    if (this.product.image?.m) {
      this.productImage = this.product.image?.m;
    }

    this.subTotal = this.product.value * this.product.quantity;

  }

}
