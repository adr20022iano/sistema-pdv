import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {CustomValidators} from 'src/app/modules/shared/validators/custom-validators';
import {NewStockHandling} from '../../models/new-stock-handling';
import {Product} from '../../models/product';
import {PRODUCT_HANDLING_TYPE} from '../../models/product-handling-type.enum';
import {ProductsService} from '../../services/products.service';
import {AuthService} from '../../../core/services/auth.service';

export interface NewStockHandlingData {
  product: Product;
  production: boolean;
}

@Component({
  selector: 'lpdv-new-stock-handling',
  templateUrl: './new-stock-handling.component.html',
  styleUrls: ['./new-stock-handling.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewStockHandlingComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Formulário de movimentação */
  handlingForm = new FormGroup({
    history: new FormControl(''),
    quantity: new FormControl('', [Validators.required, CustomValidators.zero]),
    cost: new FormControl(),
    averageCost: new FormControl(false),
    type: new FormControl(PRODUCT_HANDLING_TYPE.ENTRY, [Validators.required])
  });

  /** Se está realizando a movimentação de um produto de produção. */
  production = false;

  /** O produto que está sendo movimentado */
  product: Product;

  /** Placeholder do campo valor de custo */
  costInputPlaceHolder: string;

  /** Número de casas decimais permitidas no campo quantidade */
  quantityDecimalPlaces = 3;

  constructor(private sideMenuRef: DcSideMenuRef<NewStockHandlingComponent>, private productsService: ProductsService,
              @Inject(SIDE_MENU_DATA) public data: NewStockHandlingData, private layoutService: LayoutService,
              private snackBar: DcSnackBar, private authService: AuthService) {

    this.product = data.product;
    this.production = data.production;

    if (this.product.cost) {
      this.costInputPlaceHolder = this.product.cost.toLocaleString('pt-br', {minimumFractionDigits: 2});
    }

    if (this.product.unit === 'UNID') {
      this.quantityDecimalPlaces = 0;
    }

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    const userConfig = this.authService.getUserConfig();

    if (userConfig?.selectedAverageCost) {
      this.handlingForm.get('averageCost').setValue(true);
    }

    this.handlingForm.get('type').valueChanges.pipe(takeUntil(this.unsub)).subscribe(newValue => {

      if (newValue && newValue === PRODUCT_HANDLING_TYPE.ENTRY) {

        this.handlingForm.get('cost').enable();
        this.handlingForm.get('averageCost').enable();

      } else {

        this.handlingForm.get('cost').setValue(null);
        this.handlingForm.get('averageCost').setValue(false);
        this.handlingForm.get('cost').disable();
        this.handlingForm.get('averageCost').disable();

      }

    });

  }

  /**
   * Realiza o lançamento
   */
  saveStockHandling() {

    if (this.handlingForm.invalid) {
      return;
    }

    this.handlingForm.disable({emitEvent: false});
    const formData = this.handlingForm.value as NewStockHandling;
    formData.productCode = this.product.code;

    this.productsService.newStockHandling(formData).pipe(takeUntil(this.unsub)).subscribe(() => {

      // Se o lançamento é realizado com sucesso, fechamos o sideMenu
      // retornando o novo estoque do produto
      const currentStock = this.product.stock;

      if (formData.type === PRODUCT_HANDLING_TYPE.ENTRY) {

        this.snackBar.open('Alimentação de estoque realizada com sucesso.', null, {
          duration: 3500,
          panelClass: 'sucesso'
        });
        this.sideMenuRef.close(currentStock + formData.quantity);

      } else {

        const msg = formData.type === PRODUCT_HANDLING_TYPE.LOST ? 'Perda' : 'Saída';
        this.snackBar.open(msg.concat(' de estoque realizada com sucesso.'), null, {
          duration: 3500,
          panelClass: 'sucesso'
        });
        this.sideMenuRef.close(currentStock - formData.quantity);

      }

    }, () => {

      this.handlingForm.enable();

    });

  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
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
