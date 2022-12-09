import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {Customer} from 'src/app/modules/customers/models/customer';
import {CustomersService} from 'src/app/modules/customers/services/customers.service';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {SalesFilter} from '../../models/sales-filter';
import {AuthService} from '../../../core/services/auth.service';
import {SellersService} from '../../../sellers/services/sellers.service';
import {Seller} from '../../../sellers/models/seller';
import {CustomValidators} from '../../../shared/validators/custom-validators';

@Component({
  selector: 'lpdv-sales-filter',
  templateUrl: './sales-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesFilterComponent implements OnInit, OnDestroy {

  /** Se a visualização atual é mobile */
  isMobile = false;

  /** Lista de clientes do autocomplete */
  autocompleteCustomers = new BehaviorSubject<Customer[]>([]);

  /** Formulário dos dados extras */
  filterForm = new FormGroup({
    customer: new FormControl('', CustomValidators.objectKeyValidator('code')),
    codeObservation: new FormControl(''),
    date: new FormControl(''),
    paymentStatus: new FormControl(''),
    origin: new FormControl(),
    locked: new FormControl(),
    sellerCode: new FormControl(),
    value: new FormControl()
  });

  /** Lista de vendedores */
  sellers = new BehaviorSubject<Seller[]>([]);

  /** Se deve exibir o campo origem da venda */
  showSaleOrigin: boolean;

  /** Se o sistema trabalha com módulo de vendas externas */
  externalSalesModule: boolean;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<SalesFilterComponent>, private customersService: CustomersService,
              private layoutService: LayoutService, @Inject(SIDE_MENU_DATA) public filter: SalesFilter,
              private authService: AuthService, private sellersService: SellersService) {

    const userConfig = this.authService.getUserConfig();
    this.externalSalesModule = userConfig?.externalSalesModule;

    // Define se deve exibir a opção de origem da venda
    this.showSaleOrigin = (userConfig?.catalogModule || this.externalSalesModule) && !this.filter.filterQuotes;

  }

  /**
   * Retorna a string usada para complementar labels no template
   */
  get filterLabel(): string {
    return this.filter.filterQuotes ? 'do orçamento' : 'da venda';
  }

  /**
   * Retorna a string usada no botão de filtrar
   */
  get filterButtonLabel(): string {
    return this.filter.filterQuotes ? 'Filtrar orçamentos' : 'Filtrar vendas';
  }

  ngOnInit(): void {

    this.initAutoComplete();
    this.initLayoutChanges();
    this.getSellers();

    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.filterForm.patchValue(this.filter, {emitEvent: true});

      if (this.filter.customerCode) {
        this.loadCustomer(this.filter.customerCode);
      }

    });

  }

  /**
   * Fecha o menu retornando ao filtro informado
   * @param resetFilter Se deve redefinir o filtro ou não
   */
  filterSales(resetFilter?: boolean) {

    if (resetFilter) {
      this.sideMenuRef.close(true);
      return;
    }

    if (this.filterForm.invalid) {
      return;
    }

    const formData = this.filterForm.value;
    const filtro: SalesFilter = {
      customerCode: this.getCustomerCode(),
      codeObservation: formData.codeObservation,
      date: formData.date,
      paymentStatus: formData.paymentStatus,
      origin: formData.origin,
      sellerCode: formData.sellerCode,
      locked: formData.origin === 2 ? formData.locked : undefined,
      value: formData.value
    };

    // Fecha o menu
    this.sideMenuRef.close(filtro);

  }

  /**
   * Função usada para retornar o nome do cliente na exibição do autocomplete
   */
  dispCustomers(customer?: Customer) {
    return customer ? customer.name : undefined;
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

  /**
   * Função trackBy para a lista de vendedores
   */
  sellersTrackBy(index: number, seller: Seller) {
    return seller.code;
  }

  /**
   * Inicializa o autocomplete dos clientes
   */
  private initAutoComplete() {

    this.filterForm.get('customer').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      // Certifica-se de que está buscando uma string com 3 ou mais caracteres
      if (typeof value === 'string' && value.length >= 3) {

        // Realiza a consulta dos clientes sem distinção por cidade
        this.customersService.getCustomers({name: value}).pipe(takeUntil(this.unsub)).subscribe((response) => {

          // Emite a resposta no behaviorSubject
          this.autocompleteCustomers.next(response);

        });
      }
    });

    this.filterForm.get('codeObservation').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {
      this.toggleForm(!value);
    });

  }

  /**
   * Habilita ou desabilita todos os campos do filtro, exceto o de codObs.
   * @param enable Se deve habilitar ou desabilitar os campos.
   */
  private toggleForm(enable: boolean) {

    if (enable) {

      this.filterForm.get('customer').enable();
      this.filterForm.get('date').enable();
      this.filterForm.get('paymentStatus').enable();
      this.filterForm.get('locked').enable();
      this.filterForm.get('origin').enable();
      this.filterForm.get('sellerCode').enable();

    } else {

      this.filterForm.get('customer').disable();
      this.filterForm.get('date').disable();
      this.filterForm.get('paymentStatus').disable();
      this.filterForm.get('locked').disable();
      this.filterForm.get('origin').disable();
      this.filterForm.get('sellerCode').disable();

    }

  }

  /**
   * Realiza a consulta de um cliente.
   * @param customerCode Código do cliente a ser consultado
   */
  private loadCustomer(customerCode: number) {

    this.customersService.getCustomerInfo(customerCode).pipe(takeUntil(this.unsub)).subscribe(response => {
      this.filterForm.get('customer').setValue({name: response.name, code: response.code});
    });

  }

  /**
   * Retorna o código do cliente selecionado ou, undefined se nenhum foi
   * especificado
   */
  private getCustomerCode(): number | undefined {

    const customer = this.filterForm.get('customer').value;
    if (customer !== null && typeof customer === 'object') {
      return customer.code;
    }

    return undefined;

  }

  /**
   * Realiza a consulta dos vendedores
   */
  private getSellers(): void {

    this.sellersService.getSellers().pipe(takeUntil(this.unsub)).subscribe(response => {
      this.sellers.next(response);
    });
  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
      this.isMobile = isMobile;
    });

  }

}
