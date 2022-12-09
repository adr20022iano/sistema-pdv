import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {Product} from '../../models/product';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'lpdv-fv-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent implements OnInit {

  /** O produto listado no componente */
  @Input() product: Product;

  /** Evento emitido ao clicar na imagem do produto */
  @Output() miniatureClick = new EventEmitter<void>();

  /** Se a integração do catálogo está ativa ou não. */
  @Input()
  set showProductImage(value: boolean) {
    this.hasMiniature = coerceBooleanProperty(value);
  }

  get showProductImage(): boolean {
    return this.hasMiniature;
  }

  /** Se a o sistema trabalha com contagem de estoque ou não. */
  @Input()
  set calculateStock(value: boolean) {
    this.showStockOptions = coerceBooleanProperty(value);
  }

  get calculateStock(): boolean {
    return this.showStockOptions;
  }

  /** A url da imagem do produto */
  productImage = '/assets/images/product-placeholder-50.png';

  /** Se o sistema trabalha com calculo de estoque ou não. */
  private showStockOptions: boolean;

  /** Se deve exibir ou não a miniatura do produto. */
  private hasMiniature: boolean;

  constructor() {
  }

  /** Adiciona a classe has-miniature se deve exibir a imagem do produto */
  @HostBinding('class.has-miniature') get showProductMiniature() {
    return this.showProductImage;
  }

  /** Adiciona a classe show-stock se deve exibir a coluna de estoque do produto */
  @HostBinding('class.show-stock') get showStockColumn() {
    return this.calculateStock;
  }

  ngOnInit(): void {

    if (this.showProductImage && this.product.image?.m) {
      this.productImage = this.product.image?.m;
    }

  }

}
