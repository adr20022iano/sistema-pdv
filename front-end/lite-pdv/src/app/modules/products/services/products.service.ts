import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SaleProduct} from '../../pos/models/sale-product';
import {CompositionProduct} from '../models/composition-product';
import {NewProduct} from '../models/new-product';
import {NewStockHandling} from '../models/new-stock-handling';
import {Product} from '../models/product';
import {ProductCategory} from '../models/product-category';
import {ProductFilter} from '../models/product-filter';
import {ProductProduction} from '../models/product-production';
import {StockHandling} from '../models/stock-handling';
import {UpdateProduct} from '../models/update-product';
import {Observable} from 'rxjs';
import {ScaleProduct} from '../models/scale-product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  /** O código do produto que deverá ser focado ao carregar a lista de produtos */
  private focusTarget: number;

  constructor(private http: HttpClient) {
  }

  /**
   * Define o código do produto que deve ser focado ao carregar a lista de produtos
   * @param productCode O código do produto que deverá ser focado
   */
  setFocusTarget(productCode: number): void {
    this.focusTarget = productCode;
  }

  /**
   * Retorna o código do produto que deve ser focado ao carregar a lista de produtos
   */
  getFocusTarget(): number {
    const currentTarget = this.focusTarget;
    this.focusTarget = undefined;
    return currentTarget;
  }

  /**
   * Adiciona um novo produto.
   * @param product O produto que será adicionado.
   */
  addProduct(product: NewProduct) {
    return this.http.post<{ code: number }>('product', JSON.stringify(product));
  }

  /**
   * Atualiza o produto informado.
   * @param updateProduct Produto que será atualizado.
   */
  updateProduct(updateProduct: UpdateProduct) {
    return this.http.patch('product', JSON.stringify(updateProduct));
  }

  /**
   * Carrega a lista de produtos
   */
  loadProducts(filter: ProductFilter) {

    let queryParams = new HttpParams();
    if (filter.page) {
      queryParams = queryParams.append('page', filter.page.toString());
    }
    if (filter.production) {
      queryParams = queryParams.append('production', filter.production.toString());
    }
    if (filter.sale) {
      queryParams = queryParams.append('sale', filter.sale.toString());
    }
    if (filter.categoryCode) {
      queryParams = queryParams.append('categoryCode', filter.categoryCode.toString());
    }
    if (filter.name) {
      queryParams = queryParams.append('name', filter.name);
    }
    if (filter.catalogSale) {
      queryParams = queryParams.append('catalogSale', filter.catalogSale.toString());
    }

    return this.http.get<Product[]>('product', {params: queryParams});

  }

  /**
   * Deleta o produto informado.
   * @param productCode Código do produto que será excluído.
   */
  deleteProduct(productCode: number) {
    return this.http.delete(`product/${productCode}`);
  }

  /**
   * Atualiza o valor de venda de um produto.
   * @param productCode Código do produto para atualização.
   * @param newValue O novo valor de venda do produto.
   * @param newExternalSaleValue O novo valor de venda externa do produto.
   */
  updateSaleValue(productCode: number, newValue: number, newExternalSaleValue: number) {
    return this.http.patch('priceUpdate', JSON.stringify({
      code: productCode,
      value: newValue,
      externalSaleValue: newExternalSaleValue
    }));
  }

  /**
   * Realiza a consulta de um produto específico.
   * @param productCode Código do produto para consulta.
   */
  getProductInfo(productCode: number) {
    return this.http.get<NewProduct>(`product/0/${productCode}`);
  }

  /**
   * Realiza a consulta de um produto via código de barras para adicionar à venda
   * @param barCode Código de barras do produto
   */
  getProductByBarCode(barCode: string): Observable<SaleProduct> {
    return this.http.get<SaleProduct>(`product/1/${barCode}`);
  }

  /**
   * Adiciona uma nova movimentação de estoque no produto.
   * @param handling A nova movimentação de estoque.
   */
  newStockHandling(handling: NewStockHandling) {
    return this.http.post('stockHandling', JSON.stringify(handling));
  }

  /**
   * Realiza a consulta das movimentações de um produto.
   * @param productCode O código do produto para a consulta.
   * @param page O número da página para a consulta.
   */
  getStockHandlings(productCode: number, page: number) {
    return this.http.get<StockHandling[]>(`stockHandling/${page}/${productCode}`);
  }

  /**
   * Deleta a movimentação informada.
   * A movimentação não pode ser excluída se estiver relacionada a uma venda.
   * @param stockHandlingCode O código da movimentação que será excluída.
   */
  deleteStockHandling(stockHandlingCode: number) {
    return this.http.delete(`stockHandling/${stockHandlingCode}`);
  }

  /**
   * Adiciona uma nova categoria de produtos.
   * @param categoryName O nome da nova categoria.
   * @param favorite Se a categoria está destacada no catálogo ou não
   */
  addCategory(categoryName: string, favorite: boolean) {
    return this.http.post<{ code: number }>('productCategory', JSON.stringify({name: categoryName, favorite}));
  }

  /**
   * Realiza a consulta das categorias de produtos.
   */
  loadCategories() {
    return this.http.get<ProductCategory[]>('productCategory');
  }

  /**
   * Realiza a atualização de uma categoria.
   * @param category A categoria que está sendo atualizada.
   */
  updateCategory(category: ProductCategory) {
    return this.http.patch('productCategory', JSON.stringify(category));
  }

  /**
   * Deleta a categoria informada.
   * @param categoryCode Código da categoria que será deletada.
   */
  deleteCategory(categoryCode: number) {
    return this.http.delete(`productCategory/${categoryCode}`);
  }

  /**
   * Salva a produção de um produto.
   * @param production A composição da produção do produto.
   */
  saveProduction(production: ProductProduction) {
    return this.http.post('production', JSON.stringify(production));
  }

  /**
   * Realiza a consulta dos produtos que compõem
   * um produto de produção.
   * @param productCode O código do produto de produção.
   */
  getCompositionProducts(productCode: number) {
    return this.http.get<CompositionProduct[]>(`production/${productCode}`);
  }

  /**
   * Retorna a lista de produtos para gerar o arquivo de integração com balanças Toledo Prix Uno 4
   */
  scaleIntegration(): Observable<ScaleProduct[]> {
    return this.http.get<ScaleProduct[]>('scalesProduct');
  }

}
