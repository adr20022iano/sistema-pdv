import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter, HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {Sale} from '../../../models/sale';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'lpdv-fv-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  /** Label exibido no status do recebimento/pagamento */
  statusLabel: string;

  /** Classe css usada na label de status do recebimento/pagamento  */
  statusClass: string;

  /** A venda exibida no item */
  @Input() sale: Sale;

  /** Se o módulo de catálogo está habilitado */
  @Input() catalogModule: boolean;

  /** Se o módulo de vendas externas está habilitado */
  @Input() externalSalesModule: boolean;

  /** Evento emitido quando o botão de financeiro é clicado */
  @Output() payments = new EventEmitter<void>();

  /** Evento emitido quando o botão de compartilhar é clicado */
  @Output() share = new EventEmitter<void>();

  /** Se a listagem é de orçamentos ou não */
  private quote: boolean;

  /** Se deve exibir ou não a miniatura do produto. */
  private focused: boolean;

  constructor(private element: ElementRef) {
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
   * Adiciona a classe para destacar o item que foi focado
   */
  @HostBinding('class.focused')
  get isFocused() {
    return this.focused;
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

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    // Verificamos se o elemento deve ser focado após ser inicializado
    if (this.focused) {
      this.element.nativeElement.scrollIntoView({block: 'center'});
      this.element.nativeElement.focus();
    }

  }

  ngOnChanges() {

    const paidValue = this.sale.paidValue;
    const saleValue = this.sale.value;

    if (paidValue === 0) {

      // Não recebido/pago
      this.statusClass = 'pending-payment';
      this.statusLabel = 'A receber';

    } else if (paidValue < saleValue) {

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

    }

  }

  ngOnDestroy() {

  }

}
