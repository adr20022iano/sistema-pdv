import {Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject} from '@angular/core';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {LayoutService} from '@core/services/layout.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Product} from '../../models/product';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {ShoppingCartService} from '../../../cart/services/shopping-cart.service';
import {CartProduct} from '../../../cart/models/cart-product';

@Component({
  selector: 'clpdv-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsComponent implements OnInit, OnDestroy {

  /** Placeholder padrão para lista de imagens */
  defaultPlaceholder = 'assets/images/placeholders/product-placeholder.svg';

  /** Formulário para adicionar um produto ao carrinho */
  productForm = new FormGroup({
    quantity: new FormControl(1, [IntegerValidator, Validators.min(1)])
  });

  /** Label exibida no botão do formulário do carrinho */
  addToCartBtnLabel = 'Adicionar ao Carrinho';

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private sideMenuRef: DcSideMenuRef<ProductDetailsComponent>, @Inject(SIDE_MENU_DATA) public product: Product,
              private layoutService: LayoutService, private shoppingCart: ShoppingCartService) {

    // Recupera se o produto já foi adicionado ao carrinho
    const addedProduct = this.shoppingCart.getCartProductByCode(product.code);

    if (addedProduct) {
      this.productForm.get('quantity').setValue(addedProduct.quantity);
      this.addToCartBtnLabel = 'Atualizar';
    }

  }

  /**
   * Retorna se o botão de reduzir quantidade deve estar habilitado ou não
   */
  get reduceDisabled(): boolean {
    return this.productForm.get('quantity').value === 1;
  }

  /** Se o produto está no carrinho ou não */
  get isInCart(): boolean {
    return this.product.addedToCart;
  }

  ngOnInit(): void {
    this.initLayoutChanges();
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Atualiza a quantidade do input do formulário do carrinho quando os botões de +  ou -  são pressionados
   * @param increment Se deve aumentar ou reduzir a quantidade
   */
  updateQuantity(increment: boolean): void {

    const controller = this.productForm.get('quantity');
    const currentQuantity: number = controller.value;

    if (increment) {

      const newQuantity = currentQuantity + 1;
      controller.setValue(newQuantity);

    } else {

      const newQuantity = currentQuantity - 1;
      controller.setValue(Math.max(newQuantity, 0));

    }

  }

  /**
   * Adiciona o produto ao carrinho
   */
  addProduct(): void {

    if (this.productForm.invalid) {
      return;
    }

    const quantity = this.productForm.get('quantity').value;
    const cartProduct: CartProduct = {...this.product, quantity};
    this.shoppingCart.addProductToCart(cartProduct);
    this.product.addedToCart = true;
    this.sideMenuRef.close(true);

  }

  /**
   * Remove o produto do carrinho
   */
  removeFromCart(): void {

    this.shoppingCart.removeProductFromCart(this.product.code);
    this.product.addedToCart = false;
    this.sideMenuRef.close(true);

  }

  /**
   * Bloqueia eventos no teclado do android que causam error
   * na quantidade
   */
  qtdKeyDown(evt: KeyboardEvent): void {

    if (evt.key === 'Unidentified') {
      evt.preventDefault();
      return;
    }

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges(): void {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '720px', '100%');
    });

  }

}

/**
 * Função usada como validador para valores inteiros no input de quantidade
 * @param control O controlador que será validado.
 */
export function IntegerValidator(control: AbstractControl): ValidationErrors {

  const value: any = control.value;

  if (Number.isFinite(value)) {
    return Number.isInteger(value) ? null : {integer: true};
  }

  return null;

}
