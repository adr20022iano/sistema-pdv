import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {CartProduct} from '../models/cart-product';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CustomerOrder} from '../models/customer-order';
import {OrderDetails} from '../../user/components/models/order-details';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  /** Número total de produtos no carrinho, leva em consideração a quantidade do produto adicionada */
  totalProducts: BehaviorSubject<number>;

  /** Valor total do carrinho */
  cartValue: BehaviorSubject<number>;

  /** Key usada para acessar o carrinho no localStorage */
  private readonly CART_KEY = 'cart';

  /** Produtos atualmente no carrinho */
  private readonly cartProducts = new BehaviorSubject<CartProduct[]>([]);

  constructor(private snackBar: DcSnackBar, private http: HttpClient) {

    const products = localStorage.getItem(this.CART_KEY) || '[]';
    this.cartProducts.next(JSON.parse(products));
    this.totalProducts = new BehaviorSubject<number>(this.countProductsOnCart());
    this.cartValue = new BehaviorSubject<number>(this.calculateCartValue());

  }

  /**
   * Adiciona um produto ao carrinho, se o produto já existir, soma a nova
   * quantidade informada à do produto já adicionado.
   * @param product
   */
  addProductToCart(product: CartProduct): void {

    const currentProducts = this.cartProducts.getValue();
    const productIndex = currentProducts.findIndex(item => item.code === product.code);

    let message = 'Produto adicionado ao carrinho';
    if (productIndex > -1) {

      const currentProduct = currentProducts[productIndex];
      currentProduct.quantity = product.quantity;
      currentProducts.splice(productIndex, 1, currentProduct);
      this.updateCart(currentProducts);
      message = 'Quantidade do produto atualizada';

    } else {

      const newProducts = [product, ...currentProducts];
      this.updateCart(newProducts);

    }

    this.snackBar.open(message, null, {duration: 3500, panelClass: 'snackbar-success'});

  }

  /**
   * Remove um produto do carrinho de compras.
   * @param productCode O código do produto que será removido.
   */
  removeProductFromCart(productCode: number): void {

    const currentProducts = this.cartProducts.getValue();
    const productIndex = currentProducts.findIndex(item => item.code === productCode);
    currentProducts.splice(productIndex, 1);
    this.updateCart(currentProducts);
    this.snackBar.open('Produto removido do carrinho', null, {duration: 3500, panelClass: 'snackbar-success'});

  }

  /**
   * Consulta um produto que foi adicionado ao carrinho.
   * @param productCode o código do produto.
   * @returns O produto do carrinho ou `undefined` se o produto não existir no carrinho.
   */
  getCartProductByCode(productCode: number): CartProduct {
    return this.cartProducts.getValue().find(product => product.code === productCode);
  }

  /**
   * Retorna um array contendo os IDs dos produtos adicionados ao carrinho
   */
  getCartProductsCode(): number[] {
    return Array.from(this.cartProducts.getValue(), (p => p.code));
  }

  /**
   * Retorna a lista de produtos no carrinho.
   */
  getCartProducts(): CartProduct[] {
    return this.cartProducts.getValue();
  }

  /**
   * Limpa os produtos do carrinho.
   */
  clear(): void {
    this.updateCart([]);
  }

  /**
   * Envia a requisição para finalizar a venda
   * @param products Os produtos da venda
   * @param saleObservation Observação da venda
   */
  endSale(products: Pick<CartProduct, 'code' | 'quantity'>[], saleObservation?: string): Observable<{ code: number }> {
    return this.http.post<{ code: number }>('sale', JSON.stringify({products, observation: saleObservation}));
  }

  /**
   * Realiza a consulta dos pedidos de um cliente.
   */
  getCustomerOrders(page: number): Observable<CustomerOrder[]> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<CustomerOrder[]>('sale', {params});
  }

  /**
   * Realiza a consulta dos detalhes do pedido.
   * @param orderCode Código do pedido.
   */
  getOrderDetails(orderCode: number): Observable<OrderDetails> {
    return this.http.get<OrderDetails>('sale/'.concat(orderCode.toString()));
  }

  /**
   * Atualiza a lista de produtos do carrinho salvos localmente.
   * @param products A lista a ser salva localmente.
   * @private
   */
  private updateCart(products: CartProduct[]): void {
    this.cartProducts.next(products);
    this.totalProducts.next(this.countProductsOnCart());
    this.cartValue.next(this.calculateCartValue());
    localStorage.setItem(this.CART_KEY, JSON.stringify(products));
  }

  /**
   * Retorna o total de produtos no carrinho
   * @private
   */
  private countProductsOnCart(): number {

    const cartProducts = this.cartProducts.getValue();
    return cartProducts.map(product => product.quantity).reduce((previous, current) => {
      return previous + current;
    }, 0);

  }

  /**
   * Retorna o valor total do carrinho
   * @private
   */
  private calculateCartValue(): number {

    const cartProducts = this.cartProducts.getValue();
    return cartProducts.map(product => product.quantity * product.value).reduce((previous, current) => {
      return previous + current;
    }, 0);

  }

}
