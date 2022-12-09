import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {Customer} from '../../../../customers/models/customer';
import {LayoutService} from '../../../../core/services/layout.service';
import {CustomersService} from '../../../../customers/services/customers.service';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Subject} from 'rxjs';
import {Platform} from '@angular/cdk/platform';
import {DcInput} from '@devap-br/devap-components/input';
import {FormControl, FormGroup} from '@angular/forms';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {SaleCustomerComponent} from './sale-customer/sale-customer.component';

/**
 * Resultado das operações da janela para selecionar um cliente
 */
export interface SelectCustomerResult {

  /** O cliente que foi selecionado */
  selectedCustomer?: Customer;

  /** Evento que foi retornado pela janela */
  event?: 'new-customer' | 'remove-customer';

}

@Component({
  selector: 'lpdv-select-customer',
  templateUrl: './select-customer.component.html',
  styleUrls: ['./select-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCustomerComponent implements OnInit, AfterViewInit, OnDestroy {

  /** Referência do input de filtro do cliente */
  @ViewChild('customerInput') customerInput: ElementRef<DcInput>;

  /** Referência da lista dos clientes */
  @ViewChild('customersList') customersList: ElementRef<HTMLDivElement>;

  /** Formulário de busca de clientes */
  customerForm = new FormGroup({
    customer: new FormControl('')
  });

  /** Lista dos clientes */
  customers = new BehaviorSubject<Customer[]>([]);

  /** Query dos componentes da lista de clientes */
  @ViewChildren(SaleCustomerComponent) saleCustomerComponents: QueryList<SaleCustomerComponent>;

  /** Key manager para a lista dos clientes */
  private keyManager: ActiveDescendantKeyManager<SaleCustomerComponent>;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private sideMenuRef: DcSideMenuRef<SelectCustomerComponent>, @Inject(SIDE_MENU_DATA) public selectedCustomer: Customer,
              private layoutService: LayoutService, private customersService: CustomersService, private platform: Platform,
              private cdr: ChangeDetectorRef) {

  }

  /**
   * Determina para qual posição a lista de clientes deve realizar o scroll para que a opção selecionada seja exibida
   * @param optionOffset O offsetTop da opção para onde devemos dar scroll.
   * @param optionHeight Altura da opção.
   * @param currentScrollPosition Posição atual do scroll da lista.
   * @param panelHeight Altura da lista.
   */
  private static getOptionScrollPosition(optionOffset: number, optionHeight: number, currentScrollPosition: number,
                                         panelHeight: number): number {

    if (optionOffset < currentScrollPosition) {
      return optionOffset;
    }

    if (optionOffset + optionHeight > currentScrollPosition + panelHeight) {
      return Math.max(0, optionOffset - panelHeight + optionHeight);
    }

    return currentScrollPosition;

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.initCustomerSearch();

    // Definimos o cliente na exibição após a inicialização do autocomplete, para que a consulta seja realizada
    // e o valor de débito do mesmo seja exibido corretamente
    if (this.selectedCustomer) {
      this.customers.next([this.selectedCustomer]);
      this.customerForm.get('customer').setValue(this.selectedCustomer.name);
    }

    // Se não está no mobile, foca o input de cliente
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      if (!this.platform.IOS && !this.platform.ANDROID) {
        this.customerInput.nativeElement.focus();
      }
    });

  }

  ngAfterViewInit(): void {

    // Inicializa o keyManager
    this.keyManager = new ActiveDescendantKeyManager<SaleCustomerComponent>(this.saleCustomerComponents).withWrap(true);

  }

  /**
   * Controla os eventos do teclado para gerenciar a lista
   */
  @HostListener('keydown', ['$event'])
  keyDown(event?: KeyboardEvent): void {

    // Quando a tecla enter é pressionada, selecionamos o cliente
    if (event?.key === 'Enter') {
      this.setSaleCustomer(this.customers.getValue()[this.keyManager.activeItemIndex]);
    } else {

      // Define se uma das teclas para cima ou para baixo foi pressionada
      const isArrowKey = event.key === 'ArrowDown' || event.key === 'ArrowUp';

      // Envia o evento para o keyManager
      this.keyManager.onKeydown(event);

      // Se necessário, navega realiza o scroll para a opção que não está sendo exibida
      if (isArrowKey) {
        this.scrollToOption();
      }

    }

  }

  /**
   * Função trackBY para a lista de clientes
   */
  customersTrackBy(index: number, item: Customer) {
    return item.code;
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Seleciona o cliente da venda
   * @param customer O cliente selecionado na lista por clique ou enter no teclado
   */
  setSaleCustomer(customer: Customer): void {
    const result: SelectCustomerResult = {selectedCustomer: customer};
    this.sideMenuRef.close(result);
  }

  /**
   * Define o scrollTop da lista dos clientes. Isso nos permite realizar o scroll manualmente para exibir as opções
   * acima ou abaixo do limite da div, já que elas não estão tecnicamente sendo focadas quando ativas.
   */
  setCustomersListScrollTop(scrollTop: number): void {
    this.customersList.nativeElement.scrollTop = scrollTop;
  }

  /**
   * Retorna o scrollTop da lista dos clientes
   */
  getCustomersListScrollTop(): number {
    return this.customersList.nativeElement.scrollTop;
  }

  /**
   * Retorna a altura da lista dos clientes
   */
  getCustomersListHeight(): number {
    return this.customersList.nativeElement.offsetHeight;
  }

  /**
   * Adiciona um novo cliente
   */
  addCustomer(): void {
    const result: SelectCustomerResult = {event: 'new-customer'};
    this.sideMenuRef.close(result);
  }

  /**
   * Remove o cliente selecionado
   */
  removeCustomer(): void {
    const result: SelectCustomerResult = {event: 'remove-customer'};
    this.sideMenuRef.close(result);
  }

  /**
   * Inicializa a busca dos clientes
   * @private
   */
  private initCustomerSearch(): void {

    this.customerForm.get('customer').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      // Certifica-se de que está buscando uma string com 2 ou mais caracteres
      if (typeof value === 'string' && value.length >= 2) {

        // Realiza a consulta dos clientes sem distinção por cidade
        this.customersService.getCustomers({
          name: value,
          city: null,
        }).pipe(takeUntil(this.unsub)).subscribe((response) => {

          // Emite a resposta no behaviorSubject
          this.customers.next(response);

          // Define o primeiro item como ativo
          this.setFirstItemActive();

        });
      }
    });

  }

  /**
   * Define o primeiro item da lista como o ativo
   * @private
   */
  private setFirstItemActive(): void {

    // Detectamos as alterações pois após a emissão das alterações, o keyManager ainda não foi atualizado
    this.cdr.detectChanges();
    this.keyManager.setFirstItemActive();

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

  /**
   * Já que não estamos realmente focando as opções ativas, nós devemos ajustar o scroll manualmente
   * para revelar as opções abaixo do limite do painel. Primeiro, nós encontramos a diferença
   * entre a opção para o topo do painel. Se essa diferença está abaixo do limite, o novo scrollTop será
   * a diferença - a altura do painel + a altura da opção, então a opção ativa será visível no fim do
   * painel. Se aquela diferença está acima do topo do painel visível, o novo scrollTop será a diferença.
   * Se a diferença já está no painel visível, o scrollTop não é ajustado.
   */
  private scrollToOption(): void {

    // Index da opção ativa no key manager do autocomplete
    const index = this.keyManager.activeItemIndex || 0;

    // Recuperamos o offset e a altura da opção dentro da lista de clientes
    const optionOffset = this.getOptionOffsetTopByIndex(index);
    const optionHeight = this.getOptionHeightByIndex(index);

    // Define a nova posição do scrollTop
    const newScrollPosition = SelectCustomerComponent.getOptionScrollPosition(optionOffset, optionHeight,
      this.getCustomersListScrollTop(), this.getCustomersListHeight());

    // Define a nova posição do scroll da lista de clientes
    this.setCustomersListScrollTop(newScrollPosition);

  }

  /**
   * Retorna o offsetTop da opção no índice informado.
   * @param optionIndex O índice da opção;
   */
  private getOptionOffsetTopByIndex(optionIndex: number) {
    const option = this.saleCustomerComponents.toArray()[optionIndex];
    return option ? option.getHostElement().offsetTop : 0;
  }

  /**
   * Retorna a altura da opção no índice informado
   * @param optionIndex O índice da opção;
   */
  private getOptionHeightByIndex(optionIndex: number) {
    const option = this.saleCustomerComponents.toArray()[optionIndex];
    return option ? option.getHostElement().offsetHeight : 0;
  }

}
