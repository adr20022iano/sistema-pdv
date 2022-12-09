import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  HostBinding,
  ChangeDetectorRef,
  ElementRef, Output, EventEmitter, HostListener
} from '@angular/core';
import {Customer} from '../../../../../customers/models/customer';
import {Highlightable} from '@angular/cdk/a11y';

@Component({
  selector: 'lpdv-sale-customer',
  templateUrl: './sale-customer.component.html',
  styleUrls: ['./sale-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleCustomerComponent implements OnInit, Highlightable {

  /** Cliente exibido no componente */
  @Input() customer: Customer;

  /** Código do cliente selecionado atualmente */
  @Input() selectedCustomerCode: number;

  /** Evento emitido quando o cliente é selecionado */
  @Output() customerSelected = new EventEmitter<void>();

  /** Se o item está ativo ou não */
  private isActive = false;

  /** O endereço do cliente */
  customerAddress: string;

  constructor(private cdr: ChangeDetectorRef, private element: ElementRef) {
  }

  /** Define a classe do item ativo */
  @HostBinding('class.active') get activeItem() {
    return this.isActive;
  }

  /** Define a classe do item selecionado atualmente na venda */
  @HostBinding('class.selected') get selectedItem() {
    return this.selectedCustomerCode === this.customer.code;
  }

  /** Define a classe do item selecionado atualmente na venda */
  @HostBinding('class.disabled') get disabled() {
    return this.customer?.blockedSale;
  }

  @HostListener('click')
  @HostListener('keydown.enter')
  emitSelect(): void {

    if (!this.customer.blockedSale) {
      this.customerSelected.emit();
    }

  }

  ngOnInit(): void {

    const address = this.customer.address ? this.customer.address : '';
    const addressNumber = this.customer.number ? ', '.concat(this.customer.number) : '';
    const complement = this.customer.complement ? ', '.concat(this.customer.complement) : '';
    this.customerAddress = [address, addressNumber, complement].join('');

  }

  /**
   * Implementado como parte do Highlightable
   */
  getLabel(): string {
    return this.customer.name;
  }

  /**
   * Define a opção como ativa
   */
  setActiveStyles(): void {
    if (!this.isActive) {
      this.isActive = true;
      // Necessário para marcar o item após filtro
      this.cdr.markForCheck();
    }
  }

  /**
   * Define a opção como inativa
   */
  setInactiveStyles(): void {
    if (this.isActive) {
      this.isActive = false;
      this.cdr.markForCheck();
    }
  }

  /** Gets the host DOM element. */
  getHostElement(): HTMLElement {
    return this.element.nativeElement;
  }

}
