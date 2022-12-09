import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {LayoutService} from '../../../../core/services/layout.service';
import {takeUntil} from 'rxjs/operators';

export interface SaleShippingData {

  /** O Valor atual do frete */
  currentShippingValue: number;

  /** O subtotal da venda (valor dos produtos - desconto) */
  saleSubtotal: number;

}

@Component({
  selector: 'lpdv-fv-sale-shipping',
  templateUrl: './sale-shipping.component.html',
  styleUrls: ['./sale-shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleShippingComponent implements OnInit, OnDestroy {

  /** Input do desconto */
  @ViewChild('shippingInput') shippingInput: ElementRef;

  shippingForm = new FormGroup({
    value: new FormControl(0)
  });

  /** Subtotal da venda */
  saleSubTotal: number;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<SaleShippingComponent>, @Inject(SIDE_MENU_DATA) public data: SaleShippingData,
              private layoutService: LayoutService) {

    // Recupera o valor da venda
    this.saleSubTotal = data.saleSubtotal;
    this.shippingForm.get('value').setValue(data.currentShippingValue);

  }

  ngOnInit(): void {

    this.initLayoutChanges();

  }

  /** Fecha o menu lateral e retorna o valor do desconto informado */
  saveShippingCost() {

    if (this.shippingForm.invalid) {
      return;
    }

    // Recupera o valor do desconto
    const shippingValue = this.shippingForm.get('value').value;
    this.sideMenuRef.close(shippingValue);

  }

  ngOnDestroy(): void {

    this.unsub.next();
    this.unsub.complete();

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
