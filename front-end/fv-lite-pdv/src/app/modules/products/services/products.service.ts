import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SaleProduct} from '../../pos/models/sale-product';
import {Product} from '../models/product';
import {ProductCategory} from '../models/product-category';
import {ProductFilter} from '../models/product-filter';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) {
  }

  /**
   * Carrega a lista de produtos
   */
  loadProducts(filter: ProductFilter) {

    let queryParams = new HttpParams();
    if (filter.page) {
      queryParams = queryParams.append('page', filter.page.toString());
    }
    if (filter.categoryCode) {
      queryParams = queryParams.append('categoryCode', filter.categoryCode.toString());
    }
    if (filter.name) {
      queryParams = queryParams.append('name', filter.name);
    }

    return this.http.get<Product[]>('product', {params: queryParams});

  }

  /**
   * Realiza a consulta de um produto via código de barras para adicionar à venda
   * @param barCode Código de barras do produto
   */
  getProductByBarCode(barCode: string) {
    return this.http.get<SaleProduct>(`product/1/${barCode}`);
  }

  /**
   * Realiza a consulta das categorias de produtos.
   */
  loadCategories() {
    return this.http.get<ProductCategory[]>('productCategory');
  }

}
