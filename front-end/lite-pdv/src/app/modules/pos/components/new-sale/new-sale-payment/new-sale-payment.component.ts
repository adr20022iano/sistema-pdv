import {ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {AuthService} from '../../../../core/services/auth.service';
import {CashBookService} from '../../../../cash-book/services/cash-book.service';
import {DcInput} from '@devap-br/devap-components/input';
import {LayoutService} from '../../../../core/services/layout.service';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {NewSalePaymentsValues} from '../../../models/new-sale-payments';
import Big from 'big.js';

@Component({
  selector: 'lpdv-new-sale-payment',
  templateUrl: './new-sale-payment.component.html',
  styleUrls: ['./new-sale-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewSalePaymentComponent implements OnInit, OnDestroy {

  /** Troco */
  change = new BehaviorSubject(0);

  /** Valor restante para pagar a venda */
  remaining = new BehaviorSubject(0);

  /** Se a venda possui troco não calculado exclusivamente do pagamento de dinheiro */
  saleWithChangeNotByCash = false;

  /** Referência do elemento de aviso */
  @ViewChild('warning') warningMessage: ElementRef<HTMLDivElement>;

  /** Formulário de pagamentos */
  paymentsForm = new FormGroup({
    cash: new FormControl(),
    credit: new FormControl(),
    debit: new FormControl(),
    others: new FormControl()
  });

  /** Referência do input de dinheiro para focar ao pressionar o atalho */
  @ViewChild('moneyInput') moneyInput: ElementRef<DcInput>;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<NewSalePaymentComponent>, private authService: AuthService,
              private cashBookService: CashBookService, private layoutService: LayoutService,
              @Inject(SIDE_MENU_DATA) public readonly saleTotal: number) {


  }

  ngOnInit(): void {

    this.initLayoutChanges();

    // Realiza o cálculo dos valores assim que a janela é aberta
    this.calculateValues();

    // Realiza o cálculo dos valores quando algum pagamento é informado
    this.paymentsForm.valueChanges.pipe(debounceTime(350), takeUntil(this.unsub)).subscribe((value: NewSalePaymentsValues) => {

      // Realiza o cálculo dos valores
      this.calculateValues(value);

    });

  }

  ngOnDestroy() {

    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Emite o evento informando os valores da venda para ser finalizada
   */
  @HostListener('document:keydown.F2')
  save(): void {

    // Verificamos se os pagamentos são válidos e não existe troco por pagamentos exceto dinheiro
    if (this.paymentsForm.invalid || this.saleWithChangeNotByCash) {
      return;
    }

    // Recupera os dados dos pagamentos
    const payments = this.paymentsForm.getRawValue() as NewSalePaymentsValues;
    payments.change = this.change.getValue();

    // Fecha o menu
    this.sideMenuRef.close(payments);

  }

  /**
   * Retorna se o valor dos pagamentos informados é válido, ou seja,
   * se o valor pago em cartão de crédito + débito + outros é menor ou igual ao da venda.
   */
  private validPayments(): boolean {

    const payments = this.paymentsForm.getRawValue() as NewSalePaymentsValues;
    const saleTotal = this.saleTotal;
    const paidTotal = this.getPaidTotal(payments);

    // Se pagamentos via cartão de crédito, débito, ou outros foram informados, o total pago deve ser igual ou menor
    // que o total da venda
    if (payments.credit || payments.debit || payments.others) {
      return paidTotal <= saleTotal;
    }

    // Se pagamentos via cartão ou outros não foram informados, retornamos true, pois o excedente em dinheiro é
    // considerado como troco
    return true;

  }

  /**
   * Realiza o cálculo dos valores pagos e restantes da compra
   * @param payments Valores informados no formulário de pagamentos
   */
  private calculateValues(payments?: NewSalePaymentsValues) {

    // Recupera o total pago
    const paid = this.getPaidTotal(payments);

    // Define o valor restante
    this.remaining.next(Math.max(0, this.saleTotal - paid));

    // Valida os campos
    const valid = this.validPayments();
    this.saleWithChangeNotByCash = !valid;

    // Define o valor do troco, ou 0 se for negativo
    this.change.next(valid ? Math.max(0, paid - this.saleTotal) : 0);

  }

  /**
   * Retorna o total dos valores já pagos.
   * @param payments Valores informados no formulário de pagamentos.
   */
  private getPaidTotal(payments?: NewSalePaymentsValues): number {

    const paidValues = payments ? payments : this.paymentsForm.getRawValue() as NewSalePaymentsValues;
    return new Big(paidValues.credit || 0)
      .add(new Big(paidValues.debit || 0))
      .add(new Big(paidValues.others || 0))
      .add(new Big(paidValues.cash || 0))
      .toNumber();

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


