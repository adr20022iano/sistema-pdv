import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {Sale} from '../../../models/sale';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {SALE_ORIGIN} from '../../../models/sale-origin.enum';

@Component({
  selector: 'lpdv-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  /** Label exibido no status do recebimento/pagamento */
  statusLabel: string;

  /** Classe css usada na label de status do recebimento/pagamento  */
  statusClass: string;

  /** Ícone da origem da venda  */
  originIcon: string;

  /** Tooltip da origem da venda */
  saleOriginTooltip: string;

  /** Classe para origem da venda */
  saleOriginClass: string;

  /** Se deve exibir a opção de bloquear/desbloquear a edição da venda no aplicativo Força de Vendas */
  showBlockButton: boolean;

  /** Se deve exibir a coluna de responsáveis */
  showResponsibleColumn: boolean;

  /** A venda exibida no item */
  @Input() sale: Sale;

  /** Se o usuário é administrador */
  @Input() admin: boolean;

  /** Se o módulo de catálogo está habilitado */
  @Input() catalogModule: boolean;

  /** Se o módulo de vendas externas está habilitado */
  @Input() externalSalesModule: boolean;

  /** Evento emitido quando o botão editar é clicado */
  @Output() edit = new EventEmitter<void>();

  /** Evento emitido quando o botão excluir é clicado */
  @Output() delete = new EventEmitter<void>();

  /** Evento emitido quando o botão imprimir é clicado */
  @Output() print = new EventEmitter<void>();

  /** Evento emitido quando o botão de financeiro é clicado */
  @Output() payments = new EventEmitter<void>();

  /** Evento emitido quando o botão de compartilhar é clicado */
  @Output() share = new EventEmitter<void>();

  /** Se o usuário é pode apagar a venda ou não */
  @Input() canDelete: boolean;

  /** Evento emitido ao clicar no botão de alterar o status de bloqueio da venda */
  @Output() changeBlock = new EventEmitter<void>();

  /** Se a listagem é de orçamentos ou não */
  private quote: boolean;

  /** Se deve exibir ou não a miniatura do produto. */
  private focused: boolean;

  constructor(private element: ElementRef) {
  }

  /**
   * Define se está exibindo orçamentos ou não.
   */
  @Input()
  set showingQuotes(value) {
    this.quote = coerceBooleanProperty(value);
  }

  /**
   * Retorna se está exibindo orçamentos ou não
   */
  @HostBinding('class.is-quote')
  get isQuote() {
    return this.quote;
  }

  /**
   * Se o item deve ser focado com scroll após a sua inicialização
   * @param focus True se deve focar, false se não
   */
  @Input()
  set shouldFocus(focus: boolean) {
    this.focused = coerceBooleanProperty(focus);
  }

  /**
   * Adiciona a classe para destacar o item focado
   */
  @HostBinding('class.focused')
  get isFocused() {
    return this.focused;
  }

  /**
   * Adiciona a classe se a venda possuir um vendedor
   */
  @HostBinding('class.has-seller')
  get hasSeller() {
    return !!this.sale.seller;
  }

  ngOnInit(): void {

    if (this.catalogModule || this.externalSalesModule) {
      this.setSaleOrigin();
    }


  }

  ngAfterViewInit(): void {

    // Verificamos se o elemento deve ser focado após ser inicializado
    if (this.focused) {
      this.element.nativeElement.scrollIntoView({block: 'center'});
      this.element.nativeElement.focus();
    }

  }

  ngOnChanges() {
    this.setPaymentStatus();
  }

  ngOnDestroy() {

  }

  /**
   * Define o status de pagamento da venda.
   * @private
   */
  private setPaymentStatus(): void {

    const paidValue = this.sale.paidValue;
    const saleValue = this.sale.value;

    if (paidValue !== 0 && paidValue < saleValue) {

      // Recebido/pago parcialmente
      this.statusClass = 'parcial-payment';
      this.statusLabel = 'Rec. parcial';

    } else if (paidValue === saleValue) {

      // Recebido/pago totalmente
      this.statusClass = 'complete-payment';
      this.statusLabel = 'Recebida';

    } else if (paidValue > saleValue) {

      // Recebido/pago acima do valor
      this.statusClass = 'superior-payment';
      this.statusLabel = 'Rec. superior';

    } else {

      // Não recebido/pago
      this.statusClass = 'pending-payment';
      this.statusLabel = 'A receber';

    }

  }

  /**
   * Define a origem da venda.
   * @private
   */
  private setSaleOrigin(): void {

    if (this.isQuote) {
      return;
    }

    switch (this.sale.origin) {

      case SALE_ORIGIN.LITE_PDV:
        this.originIcon = 'store';
        this.saleOriginClass = 'store';
        this.saleOriginTooltip = 'Origem: PDV';
        return;

      case SALE_ORIGIN.CATALOGO:
        this.originIcon = 'shopping_cart';
        this.saleOriginClass = 'catalog';
        this.saleOriginTooltip = 'Origem:  Catálogo';
        return;

      case SALE_ORIGIN.FORCA_DE_VENDAS:
        this.originIcon = 'person_pin';
        this.saleOriginClass = 'external';
        this.saleOriginTooltip = 'Origem: Força de Vedas';
        this.showBlockButton = true;
        return;

    }

  }

}
