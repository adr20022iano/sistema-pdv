import {ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Product} from 'src/app/modules/products/models/product';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'lpdv-product-layout',
  templateUrl: './product-layout.component.html',
  styleUrls: ['./product-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductLayoutComponent implements OnInit, OnChanges {

  /** Se o sistema trabalha com contagem de estoque ou não. */
  @Input()
  set calculateStock(value: boolean) {
    this.showStock = coerceBooleanProperty(value);
  }

  get calculateStock(): boolean {
    return this.showStock;
  }

  /** Se a integração do catálogo está ativa ou não. */
  @Input()
  set showProductImage(value: boolean) {
    this.hasMiniature = coerceBooleanProperty(value);
  }

  get showProductImage(): boolean {
    return this.hasMiniature;
  }

  constructor() {
  }

  /** Adiciona a classe has-miniature se deve exibir a imagem do produto */
  @HostBinding('class.has-miniature') get showProductMiniature() {
    return this.showProductImage;
  }

  get sale(): boolean {
    return this.isSale;
  }

  @Input()
  set sale(sale: boolean) {
    this.isSale = coerceBooleanProperty(sale);
  }

  /** Produto exibido no componente */
  @Input() product: Product;

  /** String usada para destacar o texto no item */
  @Input() queryString: string;

  /** O código exibido do produto */
  productCode: string;

  /** O nome exibido do produto */
  productName: string;

  /** O código de barras exibido */
  productBarCode = 'Não informado';

  /** O nome da categoria exibido */
  productCategory: string;

  /** A url da imagem do produto */
  productImage = '/assets/images/product-placeholder-50.png';

  /** Se deve exibir dados adicionais para venda */
  private isSale = false;

  /** Se deve exibir o estoque do produto ou não. */
  private showStock: boolean;

  /** Se deve exibir ou não a miniatura do produto. */
  private hasMiniature: boolean;

  /**
   * Escapa os caracteres especiais da consulta que podem causar conflito com expressão regular
   * @param queryString A string de busca
   * @private
   */
  private static escapeRegex(queryString: string): string {
    return queryString.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (this.queryString) {

      const searchRegex = new RegExp(ProductLayoutComponent.escapeRegex(this.queryString), 'gi');
      this.productCode = this.product.code.toString()
        .replace(searchRegex, '<span class="highlight">'.concat(this.queryString.toUpperCase(), '</span>'));
      this.productName = this.product.name
        .replace(searchRegex, '<span class="highlight">'.concat(this.queryString.toUpperCase(), '</span>'));
      if (this.product.categoryName) {
        this.productCategory = this.product.categoryName
          .replace(searchRegex, '<span class="highlight">'.concat(this.queryString.toUpperCase(), '</span>'));
      }
      if (this.product.barCode) {
        this.productBarCode = this.product.barCode.replace(searchRegex, '<span class="highlight">'.concat(this.queryString.toUpperCase(), '</span>'));
      }

    } else {

      this.productName = this.product.name;
      this.productCode = this.product.code.toString();
      this.productBarCode = this.product.barCode;

    }

    if (this.showProductImage && this.product.image?.m) {
      this.productImage = this.product.image.m;
    }

  }

}
