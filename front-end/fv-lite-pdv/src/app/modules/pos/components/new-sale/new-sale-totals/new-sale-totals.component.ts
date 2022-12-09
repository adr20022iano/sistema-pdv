import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {AuthService} from '../../../../core/services/auth.service';
import {NewSaleService} from '../../../services/new-sale.service';
import {SaleDiscountComponent, SaleDiscountData} from '../sale-discount/sale-discount.component';
import {takeUntil} from 'rxjs/operators';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {SaleShippingComponent, SaleShippingData} from '../sale-shipping/sale-shipping.component';

@Component({
  selector: 'lpdv-fv-new-sale-totals',
  templateUrl: './new-sale-totals.component.html',
  styleUrls: ['./new-sale-totals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewSaleTotalsComponent implements OnInit, OnDestroy {

  /** Valor total dos produtos */
  productsSubtotal: BehaviorSubject<number>;

  /** Valor de desconto */
  discount: BehaviorSubject<number>;

  /** Valor de frete */
  shipping: BehaviorSubject<number>;

  /** O valor total da venda */
  saleTotal: BehaviorSubject<number>;

  /** Se o usuário pode aplicar desconto à venda ou não */
  canApplyDiscount: boolean;

  /** Referência do serviço de nova venda */
  @Input() newSaleService: NewSaleService;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private authService: AuthService, private sideMenu: DcSideMenu,
              private snackBar: DcSnackBar) {

    this.canApplyDiscount = this.authService.getUserConfig()?.sellerDiscount;

  }

  ngOnInit(): void {

    // Define os valores exibidos no componente
    this.productsSubtotal = this.newSaleService.productsSubtotal;
    this.discount = this.newSaleService.discountValue;
    this.shipping = this.newSaleService.shippingValue;
    this.saleTotal = this.newSaleService.saleTotal;

  }

  ngOnDestroy() {

    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Abre a janela para editar o desconto da venda
   */
  editDiscount(): void {

    // Se não poder aplicar desconto ou estiver com algum menu de interação aberto, não abrimos outro por cima
    if (!this.canApplyDiscount) {
      return;
    }

    // Dados para a janela de desconto
    const sideMenuData: SaleDiscountData = {
      currentDiscount: Math.abs(this.discount.getValue()),
      saleSubtotal: (this.newSaleService.productsSubtotal.getValue() + this.newSaleService.shippingValue.getValue())
    };

    this.sideMenu.open(SaleDiscountComponent, {data: sideMenuData}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe((result: number) => {

      // Recupera o valor do desconto atualizado ao fechar a janela
      if (Number.isFinite(result)) {

        this.snackBar.open('Desconto atualizado.', null, {duration: 2500, panelClass: 'sucesso'});
        this.newSaleService.setSaleDiscountValue(result);

      }

    });

  }

  /**
   * Abre o menu lateral para editar o frete da venda
   */
  editShipping(): void {

    // Se não poder aplicar desconto ou estiver com algum menu de interação aberto, não abrimos outro por cima
    if (!this.canApplyDiscount) {
      return;
    }

    const sideMenuData: SaleShippingData = {
      currentShippingValue: this.shipping.getValue(),
      saleSubtotal: (this.newSaleService.productsSubtotal.getValue() - this.newSaleService.discountValue.getValue())
    };

    this.sideMenu.open(SaleShippingComponent, {data: sideMenuData}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe((result: number) => {

      // Recupera o valor do desconto atualizado ao fechar a janela
      if (Number.isFinite(result)) {

        this.snackBar.open('Frete atualizado.', null, {duration: 2500, panelClass: 'sucesso'});
        this.newSaleService.setSaleShippingValue(result);

      }

    });

  }

}
