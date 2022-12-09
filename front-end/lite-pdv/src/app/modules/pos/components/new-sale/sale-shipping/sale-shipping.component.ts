import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {LayoutService} from '../../../../core/services/layout.service';
import {takeUntil} from 'rxjs/operators';
import {NewSaleService} from '../../../services/new-sale.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';

@Component({
  selector: 'lpdv-sale-shipping',
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

  /** Valor dos produtos da venda */
  readonly productsSubtotal: number;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<SaleShippingComponent>, private layoutService: LayoutService,
              private newSaleService: NewSaleService, private snackBar: DcSnackBar) {

    // Recupera o valor da venda
    this.productsSubtotal = this.newSaleService.getProductsSubtotal();
    this.shippingForm.get('value').setValue(this.newSaleService.getShipping());

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
    this.newSaleService.setSaleShippingValue(shippingValue);
    this.snackBar.open('Frete atualizado', null, {duration: 2500, panelClass: 'sucesso'});
    this.sideMenuRef.close();

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
