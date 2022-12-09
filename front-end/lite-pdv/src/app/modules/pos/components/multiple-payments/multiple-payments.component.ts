import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {LayoutService} from '../../../core/services/layout.service';
import {PosService} from '../../services/pos.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {CustomersService} from '../../../customers/services/customers.service';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {Customer} from '../../../customers/models/customer';
import {CUSTOMER_SALE} from '../../../customers/models/customer-sale.enum';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CashBookService} from '../../../cash-book/services/cash-book.service';
import {SALE_PAYMENT_TYPE} from '../../models/sale-payment-type.enum';
import {CustomValidators} from '../../../shared/validators/custom-validators';
import {MultiplePayment} from '../../models/multiple-payment';
import {DcAutocompleteSelectedEvent} from '@devap-br/devap-components';

@Component({
  selector: 'lpdv-multiple-payments',
  templateUrl: './multiple-payments.component.html',
  styleUrls: ['./multiple-payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiplePaymentsComponent implements OnInit, OnDestroy {

  /** Lista de clientes do autocomplete */
  autocompleteCustomers = new BehaviorSubject<Customer[]>([]);

  /** Formulário de pagamento */
  paymentForm = new FormGroup({
    customerCode: new FormControl('', [CustomValidators.objectKeyValidator('code', true)]),
    value: new FormControl('', [Validators.required]),
    type: new FormControl(SALE_PAYMENT_TYPE.CASH)
  });

  /** Valor devido pelo cliente */
  customerDebt = new BehaviorSubject(0);

  /** Troco exibido */
  change = new BehaviorSubject(0);

  /** O valor devido do cliente após o lançamento */
  remainingDebt = new BehaviorSubject(0);

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private sideMenuRef: DcSideMenuRef<MultiplePaymentsComponent>, private layoutService: LayoutService,
              private posService: PosService, private customersService: CustomersService, private cashBookService: CashBookService,
              private snackBar: DcSnackBar) {

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.initFormListener();

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Função usada para retornar o nome do cliente na exibição do autocomplete
   */
  dispCustomers(customers?: Customer) {
    return customers ? customers.name : undefined;
  }

  /**
   * Realiza os pagamentos.
   */
  addPayment(): void {

    if (this.paymentForm.invalid) {
      return;
    }

    this.paymentForm.disable();
    const data = this.paymentForm.getRawValue();
    const customerCode = data.customerCode.code;
    const newPayment: MultiplePayment = {...data, customerCode};

    this.posService.addMultiplePayment(newPayment).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.snackBar.open('Recebimento realizado com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
      this.sideMenuRef.close(true);

    }, () => {
      this.paymentForm.enable();
    });

  }

  /**
   * Exibe o valor de débito do cliente quando ele é selecionado no autocomplete
   * @param event O evento emitido no autocomplete.
   */
  customerSelected(event: DcAutocompleteSelectedEvent): void {
    this.customerDebt.next((event.option.value as Customer)?.debt);
    this.calculateChange();
  }

  /**
   * Inicializa o autocomplete dos clientes e o cálculo do troco informado.
   */
  private initFormListener() {

    this.paymentForm.get('customerCode').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      // Certifica-se de que está buscando uma string com 3 ou mais caracteres
      if (typeof value === 'string' && value.length >= 3) {

        // Realiza a consulta dos clientes sem distinção por cidade
        this.customersService.getCustomers({
          name: value,
          city: null,
          sale: CUSTOMER_SALE.ALL
        }).pipe(takeUntil(this.unsub)).subscribe((response) => {

          // Emite a resposta no behaviorSubject
          this.autocompleteCustomers.next(response);

        });
      }
    });

    this.paymentForm.get('value').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(() => {
      this.calculateChange();
    });

  }

  /**
   * Realiza o cálculo do troco do cliente
   * @private
   */
  private calculateChange(): void {

    const paymentValue = this.paymentForm.get('value').value || 0;
    // Define o valor do troco, ou 0 se for negativo
    this.change.next((Math.max(0, paymentValue - this.customerDebt.getValue())));
    this.remainingDebt.next((Math.max(0, this.customerDebt.getValue() - paymentValue)));

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

}
