import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {DcRadioChange} from '@devap-br/devap-components';
import {NewSaleService} from '../../../services/new-sale.service';
import {calculateDiscountPercentageFromValue, calculateDiscountValueFromPercentage} from '../../../helpers/sale-helpers';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';

@Component({
  selector: 'lpdv-sale-discount',
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

  /** Total da venda */
  readonly saleTotal: number;

  /** O total do desconto calculado em porcentagem ou reais */
  calculatedDiscount = new BehaviorSubject<number>(0);

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<SaleDiscountComponent>, private layoutService: LayoutService,
              private newSaleService: NewSaleService, private snackBar: DcSnackBar) {

    // Recupera o valor da venda
    this.saleTotal = this.newSaleService.getSaleValueWithoutDiscount();
    const currentDiscount = this.newSaleService.getDiscount();

    if (currentDiscount) {
      this.discountForm.get('discount').setValue(currentDiscount);
      this.calculateDiscount(currentDiscount);
    }

  }

  ngOnInit(): void {

    this.initLayoutChanges();

    // Registra para as alterações no campo desconto
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.discountForm.get('discount').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {
        this.calculateDiscount(value);
      });

    });

  }


  /**
   * Altera o tipo do input de desconto entre porcentagem e valor
   * @param event Evento emitido pelo botão radio
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
    const discountValue: number = this.discountForm.get('discount').value;
    const isDiscountInCurrency = this.discountForm.get('type').value;

// Verifica se deve realizar a conversão da porcentagem em reais
    if (isDiscountInCurrency) {
      this.newSaleService.setSaleDiscountValue(discountValue);
    } else {

      // Calcula o desconto em reais baseado na porcentagem de desconto informada
      this.newSaleService.setSaleDiscountValue(calculateDiscountValueFromPercentage(this.saleTotal, discountValue));

    }

    this.snackBar.open('Desconto atualizado', null, {duration: 2500, panelClass: 'sucesso'});
    this.sideMenuRef.close();

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
    const saleTotal = this.saleTotal;

    // Verifica se algum valor foi informado
    if (value > 0 && saleTotal > 0) {

      // Verifica qual tipo de cálculo deve ser efetuado
      if (this.discountForm.get('type').value === true) {

        // Emite o desconto em porcentagem, com no máximo 100%
        this.calculatedDiscount.next(calculateDiscountPercentageFromValue(saleTotal, value));

      } else {

        // Emite o valor do desconto em reais
        this.calculatedDiscount.next(calculateDiscountValueFromPercentage(saleTotal, value));

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
