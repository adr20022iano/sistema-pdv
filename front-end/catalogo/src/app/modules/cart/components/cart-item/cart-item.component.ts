import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {CartProduct} from '../../models/cart-product';

@Component({
  selector: 'clpdv-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartItemComponent implements OnInit, OnChanges {

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

  }

  ngOnChanges(): void {
    this.subTotal = this.product.value * this.product.quantity;
  }

}
