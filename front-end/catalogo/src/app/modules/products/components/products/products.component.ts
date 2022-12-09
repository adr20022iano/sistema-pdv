import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ProductsService} from '../../services/products.service';
import {ActivatedRoute, NavigationEnd, Params, Router, RouterEvent} from '@angular/router';
import {filter, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {HasPaginationDirective} from '@shared/directives/has-pagination.directive';
import {BootstrapService} from '@base/services/bootstrap.service';
import {ProductsFilter} from '../../models/products-filter';
import {Product} from '../../models/product';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {ProductDetailsComponent} from '../product-details/product-details.component';
import {LoaderStatus} from '@shared/models/loader-status';
import {Title} from '@angular/platform-browser';
import {catalogParams} from '@core/catalog-params';
import {Platform} from '@angular/cdk/platform';

@Component({
  selector: 'clpdv-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent extends HasPaginationDirective<ProductsFilter> implements OnInit, OnDestroy {

  /** Produtos exibidos no componente */
  products = new BehaviorSubject<Product[]>([]);

  /** O nome de uma categoria que está sendo filtrada */
  filterLabel: string;

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('loading');

  /** Emite um evento quando o componente é destruído para cancelar quaisquer inscrições de observables */
  private readonly unsub = new Subject<void>();

  /** Se a plataforma atual é mobile ou não */
  private readonly isMobile: boolean;

  constructor(private productsService: ProductsService, router: Router, acRoute: ActivatedRoute,
              private bootstrapService: BootstrapService, private sideMenu: DcSideMenu, private title: Title, private platForm: Platform) {

    super(acRoute, router);
    this.isMobile = platForm.IOS || platForm.ANDROID;

    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        this.loadProducts();

      });

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

    // Emite o evento para finalizar as inscrições
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Abre o menu para exibir os detalhes de um produto.
   * @param product O produto selecionado para exibição.
   * @param productIndex O índex do produto na lista.
   */
  showProductDetails(product: Product, productIndex: number): void {

    this.sideMenu.open(ProductDetailsComponent, {data: product, autoFocus: !this.isMobile}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((result) => {

        // Ao adicionar um produto no carrinho, o menu retorna true,
        // então atualizamos o produto na listagem
        if (result) {

          const currentProducts = this.products.getValue();
          const newProduct = Object.assign({}, product);
          currentProducts.splice(productIndex, 1, newProduct);
          this.products.next(currentProducts);

        }

      });

  }

  /**
   * Função trackBy para a lista de produtos das categorias em destaque.
   */
  productsTrackBy(index: number, item: Product): number {
    return item.code;
  }

  /**
   * Carrega os produtos para exibição no componente.
   * @private
   */
  loadProducts(): void {

    this.status.next('loading');
    const currentFilter = this.getFilter();
    this.productsService.getProducts(currentFilter).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe(response => {

      this.products.next(response);
      this.setFilterLabel(currentFilter);
      this.checkResults();

    }, () => {
      this.status.next('error');
    });

  }

  /** Navega para a página inicial */
  navigateHome(): void {
    this.router.navigate(['/']).then();
  }

  /**
   * Atualiza a url do filtro
   * @param params parâmetros para a atualização do filtro, se não informado, remove os filtros
   * @protected
   */
  protected updateUrlFilter(params?: ProductsFilter): void {

    let filterParams: Params;
    filterParams = {
      page: 1,
      filter: params?.filter,
      // Usamos um operador ternário nas verificações abaixo pois o operador de optional chaining ?.
      // não para a execução em 0 ou strings vazias
      categoryCode: params?.categoryCode ? params.categoryCode : undefined
    };

    // Navegamos para a mesma rota atualizando os parâmetros de busca, que faz com que a inscrição dos eventos do
    // router carregue a lista novamente.
    this.router.navigate([], {
      relativeTo: this.acRoute,
      queryParams: filterParams,
      queryParamsHandling: 'merge',
    }).then();

  }

  /**
   * Retorna o filtro para a consulta dos produtos
   * @private
   */
  private getFilter(): ProductsFilter {

    // Recuperamos os parâmetros de filtro e verificamos qual o tipo dos produtos
    // devem ser carregados no componente
    const queryName = this.acRoute.snapshot.queryParamMap.get('filter');
    const queryCategoryCode = +this.acRoute.snapshot.queryParamMap.get('category');
    const queryPage = +this.acRoute.snapshot.queryParamMap.get('page');

    return {
      filter: queryName,
      categoryCode: queryCategoryCode ? queryCategoryCode : undefined,
      page: queryPage ? queryPage : 1
    };

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults(): void {

    this.setNextPageDisabled(this.products.getValue().length < 50);
    this.status.next(this.products.getValue().length > 0 ? 'done' : 'empty');

  }

  /**
   * Define a label do filtro atual.
   * @param currentFilter O Filtro da consulta atual.
   * @private
   */
  private setFilterLabel(currentFilter: ProductsFilter): void {

    if (currentFilter.filter) {
      this.filterLabel = currentFilter.filter;
    } else if (currentFilter.categoryCode) {

      const categories = this.bootstrapService.catalogSettings?.getValue().productCategoryList;

      if (categories) {
        const selectedCategory = categories.find(category => category.code === currentFilter.categoryCode);
        this.filterLabel = selectedCategory?.name;
      }

    } else {
      this.filterLabel = undefined;
    }

    // Define o título da página
    this.title.setTitle(this.filterLabel ? this.filterLabel.concat(' - ', catalogParams.defaultTile) : catalogParams.defaultTile);

  }

}
