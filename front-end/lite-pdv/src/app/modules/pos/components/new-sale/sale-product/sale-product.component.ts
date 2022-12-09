import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {SaleProduct} from '../../../models/sale-product';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'lpdv-sale-product',
  templateUrl: './sale-product.component.html',
  styleUrls: ['./sale-product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleProductComponent implements OnInit {

  /** O produto exibido no componente */
  @Input() product: SaleProduct;

  /** Emite o evento de remover o produto */
  @Output() delete = new EventEmitter<void>();

  /** Emite o evento de edição do produto */
  @Output() edit = new EventEmitter<void>();

  /** Emite o evento de clique na imagem do produto */
  @Output() imageClick = new EventEmitter<void>();

  /** Se a integração do catálogo está ativa ou não. */
  @Input()
  set showProductImage(value: boolean) {
    this.hasMiniature = coerceBooleanProperty(value);
  }
  get showProductImage(): boolean {
    return this.hasMiniature;
  }

  /** Link da imagem do produto */
  imageUrl = '/assets/images/product-placeholder-50.png';

  /** Adiciona a classe has-miniature se deve exibir a imagem do produto */
  @HostBinding('class.has-miniature') get showProductMiniature() {
    return this.showProductImage;
  }

  /** Se deve exibir ou não a miniatura do produto. */
  private hasMiniature: boolean;

  constructor() {
  }

  ngOnInit(): void {

    if (this.showProductImage && this.product.image?.m) {
      this.imageUrl = this.product.image.m;
    }

  }

}
