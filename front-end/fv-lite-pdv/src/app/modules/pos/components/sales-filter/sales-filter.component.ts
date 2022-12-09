import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {Customer} from 'src/app/modules/customers/models/customer';
import {CustomersService} from 'src/app/modules/customers/services/customers.service';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {SalesFilter} from '../../models/sales-filter';

@Component({
  selector: 'lpdv-fv-sales-filter',
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
    customer: new FormControl(''),
    codeObservation: new FormControl(''),
    date: new FormControl(''),
    paymentStatus: new FormControl(''),
    locked: new FormControl()
  });

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<SalesFilterComponent>, private customersService: CustomersService,
              private layoutService: LayoutService, @Inject(SIDE_MENU_DATA) public filter: SalesFilter) {

  }

  ngOnInit(): void {

    this.initAutoComplete();
    this.initLayoutChanges();

    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.filterForm.patchValue(this.filter, {emitEvent: true});
      if (this.filter.customerCode) {
        this.loadCustomer(this.filter.customerCode);
      }
    });

  }

  /**
   * Fecha o menu retornando a o filtro informado
   * @param resetFilter Se deve redefinir o filtro ou não
   */
  filterSales(resetFilter?: boolean) {

    if (resetFilter) {
      this.sideMenuRef.close(true);
      return;
    }

    const formData = this.filterForm.value;
    const filtro: SalesFilter = {
      customerCode: this.getCustomerCode(),
      codeObservation: formData.codeObservation,
      date: formData.date,
      paymentStatus: formData.paymentStatus,
      locked: formData.origin === 2 ? formData.locked : undefined
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

    } else {

      this.filterForm.get('customer').disable();
      this.filterForm.get('date').disable();
      this.filterForm.get('paymentStatus').disable();
      this.filterForm.get('locked').disable();

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
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
      this.isMobile = isMobile;
    });

  }

}
