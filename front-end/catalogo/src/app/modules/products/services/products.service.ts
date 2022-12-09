import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {FeaturedCategory} from '../models/featured-category';
import {Observable} from 'rxjs';
import {Product} from '../models/product';
import {ProductsFilter} from '../models/products-filter';
import {map} from 'rxjs/operators';
import {ShoppingCartService} from '../../cart/services/shopping-cart.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient, private shoppingCart: ShoppingCartService) {
  }

  /**
   * Retorna a lista de produtos destacados para serem exibidos na página inicial.
   */
  getFeaturedProducts(): Observable<FeaturedCategory[]> {
    return this.http.get<FeaturedCategory[]>('bootstrapProduct');
  }

  /**
   * Realiza a consulta dos produtos.
   * @param filter Filtro para consulta dos produtos.
   */
  getProducts(filter: ProductsFilter): Observable<Product[]> {

    let params = new HttpParams();
    params = params.set('page', filter.page.toString());

    if (filter?.filter) {
      params = params.set('name', filter.filter);
    }

    if (filter?.categoryCode) {
      params = params.set('categoryCode', filter.categoryCode.toString());
    }

    // Recupera os códigos dos produtos adicionados ao carrinho localmente
    const cartProductsCode = this.shoppingCart.getCartProductsCode();

    return this.http.get<Product[]>('product', {params}).pipe(map(items => {
      items.forEach(item => item.addedToCart = cartProductsCode.includes(item.code));
      return items;
    }));

  }

  /**
   * Carrega os dados dos produtos do carrinho.
   * @param productCodes O código dos produtos no carrinho.
   */
  loadCartProducts(productCodes: string): Observable<Product[]> {

    const params = new HttpParams().set('product', productCodes);
    return this.http.get<Product[]>('shopCart', {params});

  }

}
