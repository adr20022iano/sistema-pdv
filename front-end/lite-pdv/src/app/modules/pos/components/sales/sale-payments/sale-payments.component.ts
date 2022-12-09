import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {DcInput} from '@devap-br/devap-components/input';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {SalePayment} from '../../../models/sale-payment';
import {NewSalePayment} from '../../../models/new-sale-payment';
import {SALE_PAYMENT_TYPE} from '../../../models/sale-payment-type.enum';
import {Sale} from '../../../models/sale';
import {PosService} from '../../../services/pos.service';
import Big from 'big.js';

@Component({
  selector: 'lpdv-sale-payments',
  templateUrl: './sale-payments.component.html',
  styleUrls: ['./sale-payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalePaymentsComponent implements OnInit, OnDestroy {

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Formulário de novo lançamento financeiro */
  paymentForm = new FormGroup({
    value: new FormControl('', [Validators.required, Validators.min(0.01)]),
    type: new FormControl(SALE_PAYMENT_TYPE.CASH)
  });

  /** Lista dos lançamentos financeiros */
  payments = new BehaviorSubject<SalePayment[]>([]);

  /** Input de valor */
  @ViewChild('valueInput') valueInput: ElementRef<DcInput>;

  /** Se o usuário pode apagar pagamentos */
  canDeletePayments = false;

  /** Troco do lançamento */
  change = new BehaviorSubject(0);

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  /** Emite eventos quando o financeiro é alterado */
  private paymentsChange = new Subject<void>();

  constructor(private sideMenuRef: DcSideMenuRef<SalePaymentsComponent>, @Inject(SIDE_MENU_DATA) public sale: Sale,
              private posService: PosService, private layoutService: LayoutService, private snackBar: DcSnackBar,
              private authService: AuthService, private dialog: DcDialog) {

    this.canDeletePayments = (this.authService.isAdmin() || this.authService.getUserConfig()?.sellerDeletePayment);

  }

  /** O valor restante da venda */
  get remainingValue(): number {
    return new Big(this.sale.value).minus(this.sale.paidValue).toNumber();
  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadPayments();
    });

    // Realiza o cálculo dos valores quando algum pagamento é informado
    this.paymentForm.get('value').valueChanges.pipe(takeUntil(this.unsub)).subscribe((value) => {

      // Define o valor do troco, ou 0 se for negativo
      this.change.next(Math.max(0, value - this.remainingValue));

    });

  }

  /**
   * Adiciona um novo lançamento financeiro à lista
   */
  addPayment() {

    if (this.paymentForm.invalid) {
      return;
    }

    this.paymentForm.disable();

    const formData = this.paymentForm.getRawValue();

    // Envia o valor informado menos o troco atual para o webservice
    const paymentValue = new Big(formData.value).minus(this.change.getValue()).toNumber();
    const newPayment: NewSalePayment = {
      saleCode: this.sale.code,
      value: paymentValue,
      type: formData.type
    };

    this.posService.addSalePayment(newPayment).pipe(takeUntil(this.unsub)).subscribe((response) => {

      const payment: SalePayment = {
        code: response.code,
        value: newPayment.value,
        date: new Date(),
        type: newPayment.type
      };

      const currentPayments = this.payments.getValue();
      this.payments.next([payment, ...currentPayments]);
      this.checkResults();

      const currentPaidValue = new Big(this.sale.paidValue);
      const newPaymentValue = new Big(newPayment.value);
      this.sale.paidValue = currentPaidValue.add(newPaymentValue).toNumber();

      this.paymentsChange.next();
      this.paymentForm.reset({value: 0, type: SALE_PAYMENT_TYPE.CASH});
      this.paymentForm.enable();


      if (this.remainingValue > 0) {

        setTimeout(() => {
          this.valueInput.nativeElement.focus();
        }, 100);

      }

    }, () => {

      this.paymentForm.enable();

    });

  }

  /**
   * Exclui um lançamento financeiro da venda.
   * @param paymentIndex Index do lançamento na listagem.
   * @param payment O lançamento realizado.
   */
  deletePayment(paymentIndex: number, payment: SalePayment) {

    const config = new ConfirmationDlgConfig(
      'Excluir lançamento?',
      'Esta operação não poderá ser revertida.',
      null,
      'Excluir',
      'Cancelar');

    this.dialog.open(ConfirmationDlgComponent, {
      data: config,
      minWidth: '35%'
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        this.posService.deleteSalePayment(payment.code).pipe(takeUntil(this.unsub)).subscribe(() => {

          const currentPayments = this.payments.getValue();
          currentPayments.splice(paymentIndex, 1);
          this.payments.next(currentPayments);

          const currentPaidValue = new Big(this.sale.paidValue);
          const deletedPaymentValue = new Big(payment.value);
          this.sale.paidValue = currentPaidValue.sub(deletedPaymentValue).toNumber();

          if (this.sale.paidValue === 0) {
            this.sale.saleChange = 0;
          }

          this.paymentsChange.next();
          this.checkResults();
          this.snackBar.open('Lançamento excluído.', null, {duration: 3500, panelClass: 'sucesso'});

        });

      }

    });

  }

  /**
   * Observable que emite sempre que um lançamento da venda é alterado.
   */
  public onPaymentsChange() {
    return this.paymentsChange.asObservable();
  }

  /**
   * Função trackBy para a lista de lançamentos.
   */
  paymentsTrackBy(index: number, item: SalePayment) {
    return item.code;
  }

  ngOnDestroy(): void {
    this.unsub.next();
    this.unsub.complete();
  }

  /**
   * Realiza o carregamento dos lançamentos da conta
   */
  private loadPayments() {

    this.posService.getSalePayments(this.sale.code).pipe(takeUntil(this.unsub)).subscribe((response) => {

      this.payments.next(response);
      this.checkResults();

    }, () => {

      this.sideMenuRef.close();

    });

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults() {
    this.status.next(this.payments.getValue().length > 0 ? 'pronto' : 'vazio');
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
