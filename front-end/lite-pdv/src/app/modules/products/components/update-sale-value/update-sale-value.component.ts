import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {Product} from '../../models/product';
import {ProductsService} from '../../services/products.service';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'lpdv-update-sale-value',
  templateUrl: './update-sale-value.component.html',
  styleUrls: ['./update-sale-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateSaleValueComponent implements OnInit, OnDestroy {

  constructor(private sideMenuRef: DcSideMenuRef<UpdateSaleValueComponent>, private produtosService: ProductsService,
              @Inject(SIDE_MENU_DATA) public produto: Product, private layoutService: LayoutService, private snackBar: DcSnackBar,
              private authService: AuthService) {

    this.externalSalesModule = this.authService.getUserConfig()?.externalSalesModule;
    if (this.externalSalesModule) {
      this.valueForm.addControl('externalSaleValue', new FormControl(''));
    }

  }

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Formulário de atualização */
  valueForm = new FormGroup({
    value: new FormControl(''),
  });

  /** A margem de lucro baseada no valor informado */
  profitMargin = 0;

  /** O markup baseado no valor informado */
  markup = 0;

  /** Se utiliza o módulo de vendas externas ou não */
  externalSalesModule: boolean;

  /** A margem de lucro baseada no valor de venda externo informado */
  externalProfitMargin = 0;

  /** O markup baseado no valor de venda externo informado */
  externalMarkup = 0;

  /**
   * Calcula a margem de lucro do produto
   * @param value O valor de venda do produto
   * @param cost O custo do produto
   * @private
   */
  private static calculateMargin(value: number, cost: number): number {

    if (value !== 0 && cost > 0) {

      const margin = value - cost;
      return (margin / value);

    }

    return 0;

  }

  /**
   * Calcula o markup de um produto
   * @param value O valor de venda do produto
   * @param cost O custo do produto
   * @private
   */
  private static calculateMarkup(value: number, cost: number): number {

    if (value !== 0 && cost > 0) {

      const markup = value - cost;
      return (markup / cost);

    }

    return 0;

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.registerValueChange();
    this.valueForm.get('value').patchValue(this.produto.value);
    if (this.externalSalesModule) {
      this.valueForm.get('externalSaleValue').patchValue(this.produto.externalSaleValue);
    }

  }

  /**
   * Realiza a atualização do valor do produto
   */
  updateValue() {

    if (this.valueForm.invalid) {
      return;
    }

    this.valueForm.disable();
    const newValue = this.valueForm.get('value').value;
    const newExternalSaleValue = this.externalSalesModule ? this.valueForm.get('externalSaleValue').value : null;
    this.produtosService.updateSaleValue(this.produto.code, newValue, newExternalSaleValue).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.sideMenuRef.close([newValue, newExternalSaleValue]);
      this.snackBar.open('Valor de venda atualizado com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.valueForm.enable();

    });

  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  private registerValueChange(): void {

    this.valueForm.get('value').valueChanges.pipe(takeUntil(this.unsub)).subscribe(value => {

      this.profitMargin = UpdateSaleValueComponent.calculateMargin(value, this.produto.cost);
      this.markup = UpdateSaleValueComponent.calculateMarkup(value, this.produto.cost);

    });

    if (this.externalSalesModule) {

      this.valueForm.get('externalSaleValue').valueChanges.pipe(takeUntil(this.unsub)).subscribe(value => {

        this.externalProfitMargin = UpdateSaleValueComponent.calculateMargin(value, this.produto.cost);
        this.externalMarkup = UpdateSaleValueComponent.calculateMarkup(value, this.produto.cost);

      });

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
