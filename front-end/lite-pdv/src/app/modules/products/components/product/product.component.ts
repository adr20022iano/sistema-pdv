import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {Product} from '../../models/product';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'lpdv-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent implements OnInit, AfterViewInit {

  /** O produto listado no componente */
  @Input() product: Product;

  /** Se o usuário é administrador do sistema */
  @Input() admin: boolean;

  /** Evento emitido ao clicar no botão editar */
  @Output() edit = new EventEmitter<void>();

  /** Evento emitido ao clicar no botão duplicar */
  @Output() duplicate = new EventEmitter<void>();

  /** Evento emitido ao clicar no campo de valor do produto */
  @Output() editValue = new EventEmitter<void>();

  /** Evento emitido ao clicar no campo de quantidade do produto */
  @Output() editStock = new EventEmitter<void>();

  /** Evento emitido ao clicar no botão de produção */
  @Output() editProduction = new EventEmitter<void>();

  /** Evento emitido ao clicar na foto do produto */
  @Output() image = new EventEmitter<void>();

  /** Se o produto listado é de produção */
  @Input() production: boolean;

  /** Se o usa o módulo de vendas externas */
  @Input() externalSalesModule: boolean;

  /** A url da imagem do produto */
  productImage = '/assets/images/product-placeholder-50.png';

  /** Se o sistema trabalha com cálculo de estoque ou não. */
  private showStockOptions: boolean;

  /** Se deve exibir ou não a miniatura do produto. */
  private hasMiniature: boolean;

  /** Label do custo do produto */
  costLabel = 'Custo';

  /** Label de quantidade */
  quantityLabel = 'Estoque';

  /** Se deve exibir ou não a miniatura do produto. */
  private focused: boolean;

  constructor(private element: ElementRef) {
  }

  get showProductImage(): boolean {
    return this.hasMiniature;
  }

  /** Se a integração do catálogo está ativa ou não. */
  @Input()
  set showProductImage(value: boolean) {
    this.hasMiniature = coerceBooleanProperty(value);
  }

  get calculateStock(): boolean {
    return this.showStockOptions;
  }

  /** Se o sistema trabalha com contagem de estoque ou não. */
  @Input()
  set calculateStock(value: boolean) {
    this.showStockOptions = coerceBooleanProperty(value);
  }

  /**
   * Se o item deve ser focado com scroll após a sua inicialização
   * @param focus True se deve focar, false se não
   */
  @Input()
  set shouldFocus(focus: boolean) {
    this.focused = coerceBooleanProperty(focus);
  }

  /** Adiciona a classe has-miniature se deve exibir a imagem do produto */
  @HostBinding('class.has-miniature') get showProductMiniature() {
    return this.showProductImage;
  }

  /** Adiciona a classe show-stock se deve exibir a coluna de estoque do produto */
  @HostBinding('class.show-stock') get showStockColumn() {
    return this.calculateStock;
  }

  /** Adiciona a classe show-cost se deve exibir a coluna de custo do produto */
  @HostBinding('class.show-cost') get showCostColumn() {
    return this.admin;
  }

  /**
   * Adiciona a classe para destacar o item focado
   */
  @HostBinding('class.focused')
  get isFocused() {
    return this.focused;
  }

  /**
   * Retorna se o usuário pode editar o estoque do produto
   */
  get canEditStock(): boolean {
    return this.admin;
  }

  /**
   * Retorna se o usuário pode editar o valor do produto
   */
  get canEditValue(): boolean {
    return this.admin;
  }

  /**
   * Retorna se o usuário pode editar o produto
   */
  get canEditProduct(): boolean {
    return this.admin;
  }

  /**
   * Retorna se o usuário pode editar a produção do produto
   */
  get canEditProduction(): boolean {
    return this.admin && this.production;
  }

  ngOnInit(): void {

    if (this.showProductImage && this.product.image?.m) {
      this.productImage = this.product.image?.m;
    }

    if (this.production) {
      this.quantityLabel = 'Previsão';
      this.costLabel = 'Custo da composição';
    }

  }

  ngAfterViewInit(): void {

    // Verificamos se o elemento deve ser focado após ser inicializado
    if (this.focused) {
      this.element.nativeElement.scrollIntoView({block: 'center'});
      this.element.nativeElement.focus();
    }

  }

  /**
   * Emite o evento de edição de valor, se for administrador.
   */
  emitValue() {

    if (this.canEditValue) {
      this.editValue.emit();
    }

  }

  /**
   * Emite o evento de edição de quantidade, se for administrador.
   */
  emitStock() {

    if (this.calculateStock && this.canEditStock) {
      this.editStock.emit();
    }

  }

}
