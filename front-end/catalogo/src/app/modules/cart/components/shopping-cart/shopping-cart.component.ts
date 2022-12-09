import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {ShoppingCartService} from '../../services/shopping-cart.service';
import {Product} from '../../../products/models/product';
import {ProductsService} from '../../../products/services/products.service';
import {map, takeUntil} from 'rxjs/operators';
import {CartProduct} from '../../models/cart-product';
import {ProductDetailsComponent} from '../../../products/components/product-details/product-details.component';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {Platform} from '@angular/cdk/platform';
import {FormControl} from '@angular/forms';
import {UserLoginComponent} from '../../../user/components/user-login/user-login.component';
import {AuthService} from '@core/services/auth.service';
import {UserOrdersComponent} from '../../../user/components/user-orders/user-orders.component';

type CartStatus = 'done' | 'loading' | 'empty' | 'error' | 'order-placed';

@Component({
  selector: 'clpdv-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShoppingCartComponent implements OnInit, OnDestroy {

  /** Total de itens no carrinho */
  numberOfItems: Subject<number>;

  /** Lista dos produtos no carrinho */
  cartProducts = new BehaviorSubject<CartProduct[]>([]);

  /** O valor total do carrinho */
  cartValue: BehaviorSubject<number>;

  /** Status da consulta */
  status = new BehaviorSubject<CartStatus>('loading');

  /** Campo de observação */
  observationControl = new FormControl('');

  /** Se o botão de finalizar venda está bloqueado ou não */
  blockEndButton: boolean;

  /** O Código do pedido realizado */
  placedOrderCode: number;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  /** Se a plataforma atual é mobile ou não */
  private readonly isMobile: boolean;

  constructor(private shoppingCart: ShoppingCartService, private productsService: ProductsService, private sideMenu: DcSideMenu,
              private platForm: Platform, private authService: AuthService) {

    this.numberOfItems = shoppingCart.totalProducts;
    this.cartValue = shoppingCart.cartValue;
    this.isMobile = platForm.IOS || platForm.ANDROID;

  }

  /**
   * Realiza o merge da quantidade do produto no carrinho à resposta dos produtos consultados.
   * @param products O produtos retornados pelo webservice.
   * @param productsInCart A lista de produtos no carrinho.
   */
  private static mergeProductsInCart(products: Product[], productsInCart: CartProduct[]): CartProduct[] {

    return products.map<CartProduct>(product => {
      const productInCart: CartProduct = {
        ...product,
        quantity: productsInCart.find(item => item.code === product.code)?.quantity,
        addedToCart: true
      };
      return productInCart;
    });

  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Abre a janela de edição do produto do carrinho.
   * @param product O produto selecionado para edição.
   * @param index O índex do produto na listagem.
   */
  editCartProduct(product: CartProduct, index: number): void {

    this.sideMenu.open(ProductDetailsComponent, {data: product, autoFocus: !this.isMobile}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((result) => {

        // Ao adicionar um produto no carrinho, o menu retorna true,
        // então atualizamos o produto na listagem
        if (result === true) {

          // Atualizamos o produto do carrinho
          const updatedProduct = this.shoppingCart.getCartProductByCode(product.code);

          if (updatedProduct) {

            const replaceProduct = {...product, quantity: updatedProduct.quantity};
            this.updateProductByIndex(index, replaceProduct);

          } else {

            // Se o produto foi removido, o removemos da lista
            this.updateProductByIndex(index);
            this.checkResults();

          }

        }

      });

  }

  /**
   * Função trackBy para a lista dos produtos
   */
  productsTrackBy(index: number, item: CartProduct): number {
    return item.code;
  }

  /**
   * Carrega os produtos do carrinho
   * @private
   */
  loadProducts(): void {

    this.status.next('loading');
    const productCodes = this.shoppingCart.getCartProductsCode();
    const productsInCart = this.shoppingCart.getCartProducts();

    this.productsService.loadCartProducts(productCodes.join(',')).pipe(
      map(products => ShoppingCartComponent.mergeProductsInCart(products, productsInCart)),
      takeUntil(this.unsub)
    ).subscribe(response => {

      this.cartProducts.next(response);
      this.checkResults();

    }, () => {
      this.status.next('error');
    });

  }

  /**
   * Finaliza a venda do usuário
   */
  endSale(): void {

    if (this.authService.isLoggedIn()) {

      const saleObservation = this.observationControl.value;
      this.toggleForm(false);

      this.shoppingCart.endSale(this.cartProducts.getValue(), saleObservation).pipe(takeUntil(this.unsub)).subscribe((response) => {

        this.clearCart(false);
        this.placedOrderCode = response.code;
        this.status.next('order-placed');

      }, () => {
        this.toggleForm(true);
      });

    } else {
      this.loginUser();
    }

  }

  /**
   * Abre a janela de pedidos do usuário
   */
  userOrders(): void {

    this.sideMenu.open(UserOrdersComponent, {
      autoFocus: false
    });

  }

  /**
   * Limpa o carrinho.
   * @param checkResults Se deve realizar a verificação de status ou não, true por padrão.
   */
  clearCart(checkResults = true): void {
    this.shoppingCart.clear();
    this.cartProducts.next([]);

    if (checkResults) {
      this.checkResults();
    }
  }

  /**
   * Se deve habilitar ou desabilitar o formulário e botão de controle.
   * @param enable Se deve habilitar o formulário ou não.
   */
  toggleForm(enable: boolean): void {

    this.blockEndButton = !enable;

    if (enable) {
      this.observationControl.enable();
    } else {
      this.observationControl.disable();
    }

  }

  /**
   * Abre a janela para o usuário realizar login.
   * @private
   */
  private loginUser(): void {

    this.sideMenu.open(UserLoginComponent, {
      autoFocus: !this.isMobile,
      data: 'Para finalizar a sua compra, você precisa acessar a sua conta.'
    }).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((result) => {

        if (result === true) {
          this.endSale();
        }

      });

  }

  /**
   * Remove um produto da lista do carrinho, se um produto for informado, o insere na posição do que foi removido.
   * @param productIndex O index do produto que será removido.
   * @param product O produto que será inserido na posição alterada.
   * @private
   */
  private updateProductByIndex(productIndex: number, product?: CartProduct): void {

    const currentProducts = this.cartProducts.getValue();
    product ? currentProducts.splice(productIndex, 1, product) : currentProducts.splice(productIndex, 1);
    this.cartProducts.next(currentProducts);

  }

  /**
   * Verifica o resultado da consulta.
   * @private
   */
  private checkResults(): void {

    const productsInCart = this.cartProducts.getValue().length;
    this.status.next(productsInCart > 0 ? 'done' : 'empty');

  }

}
