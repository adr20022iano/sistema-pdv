import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, Output} from '@angular/core';
import {Product} from '../../models/product';

@Component({
  selector: 'clpdv-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent {

  /** O produto exibido no componente */
  @Input() product: Product;

  /** Se deve exibir a o valor do produto ou não */
  @Input() showValue = true;

  /** Evento emitido quando o produto é clicado */
  @Output() productClick = new EventEmitter<Product>();

  /** Placeholder padrão para lista de imagens */
  defaultPlaceholder = 'assets/images/placeholders/product-placeholder.svg';

  /** Se o produto foi adicionado ao carrinho */
  addedToCart = false;

  /**
   * Binding para tabIndex.
   */
  @HostBinding('attr.tabindex') tabindex = 0;

  /**
   * Listener para o clique no produto.
   */
  @HostListener('click')
  mouseClick(): void {
    this.productClick.emit(this.product);
  }

  /**
   * Listener para o enter e espaço no produto.
   */
  @HostListener('keydown', ['$event'])
  keyDown(event: KeyboardEvent): void {

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.productClick.emit(this.product);
    }

  }

  constructor() {
  }

}
