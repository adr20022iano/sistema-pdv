import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {SaleProduct} from '../../../models/sale-product';
import {AuthService} from '../../../../core/services/auth.service';

@Component({
  selector: 'lpdv-edit-sale-product',
  templateUrl: './edit-sale-product.component.html',
  styleUrls: ['./edit-sale-product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditSaleProductComponent implements OnInit, OnDestroy {

  /** Formulário de edição */
  editForm: FormGroup;
  /** O número de casas decimais permitidas ao informar a quantidade de um produto */
  quantityDecimalPlaces = 3;
  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  canEditProductValue: boolean;

  constructor(@Inject(SIDE_MENU_DATA) public product: SaleProduct, private sideMenuRef: DcSideMenuRef<EditSaleProductComponent>,
              private layoutService: LayoutService, private authService: AuthService) {

    this.canEditProductValue = (this.authService.isAdmin() || this.authService.getUserConfig()?.sellerDiscount);

    this.editForm = new FormGroup({
      value: new FormControl(product.value, [Validators.required, Validators.min(0.01)]),
      quantity: new FormControl(product.quantity, [Validators.required, Validators.min(0.001)])
    });

    // Define o número de casas decimais permitidas no campo quantidade
    if (product.unit === 'UNID') {
      this.quantityDecimalPlaces = 0;
    }

  }

  ngOnInit(): void {
    this.initLayoutChanges();
  }

  /**
   * Salva as edições do produto
   */
  save() {

    // Verifica se o produto está válido
    if (this.editForm.invalid) {
      return;
    }

    // Recupera os dados do formulário
    const formData = this.editForm.getRawValue();

    // Cria o novo objeto do produto
    const updatedProduct = Object.assign({}, this.product);
    updatedProduct.quantity = +formData.quantity;
    updatedProduct.value = +formData.value;

    // Fecha o sideMenu
    this.sideMenuRef.close(updatedProduct);

  }

  ngOnDestroy() {
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
