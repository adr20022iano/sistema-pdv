import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {DcRadioChange} from '@devap-br/devap-components';

export interface SaleDiscountData {

  /** O valor de desconto atual */
  currentDiscount: number;

  /** O subtotal da venda (valor dos produtos + frete) */
  saleSubtotal: number;

}

@Component({
  selector: 'lpdv-fv-sale-discount',
  templateUrl: './sale-discount.component.html',
  styleUrls: ['./sale-discount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleDiscountComponent implements OnInit, OnDestroy {

  /** Input do desconto */
  @ViewChild('discountInput') discountInput: ElementRef;

  discountForm = new FormGroup({
    type: new FormControl(true),
    discount: new FormControl(0)
  });

  /** Subtotal da venda */
  saleSubtotal: number;

  /** O total do desconto calculado em porcentagem ou reais */
  calculatedDiscount = new BehaviorSubject<number>(0);

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<SaleDiscountComponent>, @Inject(SIDE_MENU_DATA) public data: SaleDiscountData,
              private layoutService: LayoutService) {

    // Recupera o valor dos produtos da venda
    this.saleSubtotal = data.saleSubtotal;

  }

  ngOnInit(): void {

    this.initLayoutChanges();

    // Registra para as alterações no campo desconto
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.discountForm.get('discount').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {
        this.calculateDiscount(value);
      });

      // Define o valor do desconto, se informado no formulário
      if (this.data.currentDiscount) {
        this.discountForm.get('discount').setValue(this.data.currentDiscount);
        this.calculateDiscount(this.data.currentDiscount);
      }

    });

  }

  /**
   * Altera o tipo do input de desconto entre porcentagem e valor
   * @param event Evento emitido pelo radio-button
   */
  typeChange(event: DcRadioChange) {

    // Redefine o valor do input antes de alterar o tipo
    this.discountForm.get('discount').setValue(0);

    // Foca o campo desconto
    this.discountInput.nativeElement.focus();

  }

  /** Fecha o menu lateral e retorna o valor do desconto informado */
  applyDiscount() {

    if (this.discountForm.invalid) {
      return;
    }

    // Recupera o valor do desconto
    const discountValue = this.discountForm.get('discount').value;
    const isDiscountInCurrency = this.discountForm.get('type').value;

    // Verifica se deve realizar a conversão da porcentagem em reais
    if (isDiscountInCurrency) {

      this.sideMenuRef.close(discountValue);

    } else {

      // Calcula o desconto em reais
      const discount = (discountValue / 100) * this.data.saleSubtotal;
      this.sideMenuRef.close(discount);

    }

  }

  ngOnDestroy(): void {

    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Calcula o desconto da venda baseado no valor informado
   * @param value Valor que será utilizado para calcular o desconto
   */
  private calculateDiscount(value: number) {

    // Recupera o valor da venda
    const saleValue = this.data.saleSubtotal;

    // Verifica se algum valor foi informado
    if (value > 0 && saleValue > 0) {

      // Verifica qual tipo de cálculo deve ser efetuado
      if (this.discountForm.get('type').value === true) {

        // Calcula o desconto em porcentagem
        const discount = (value * 100) / saleValue;

        // Emite o desconto em porcentagem, com no máximo 100%
        this.calculatedDiscount.next(discount > 100 ? 100 : discount);

      } else {

        // Calcula o desconto em reais
        const discount = (value / 100) * saleValue;

        // Emite o valor
        this.calculatedDiscount.next(discount);

      }

    } else {

      this.calculatedDiscount.next(0);

    }

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
