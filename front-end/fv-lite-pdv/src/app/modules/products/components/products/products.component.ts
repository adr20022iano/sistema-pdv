import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Params, Router, RouterEvent} from '@angular/router';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {Product} from '../../models/product';
import {ProductFilter} from '../../models/product-filter';
import {ProductsService} from '../../services/products.service';
import {ProductsCategoriesComponent} from '../product-categories/product-categories.component';
import {ProductsFilterComponent} from '../products-filter/products-filter.component';
import {HasPaginationDirective} from '../../../shared/directives/has-pagination.directive';
import {ProductImageDlgComponent} from '../../../shared/components/product-image-dlg/product-image-dlg.component';
import {DcDialog} from '@devap-br/devap-components/dialog';

@Component({
  selector: 'lpdv-fv-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent extends HasPaginationDirective<ProductFilter> implements OnInit, OnDestroy {

  /** Lista de produtos */
  products = new BehaviorSubject<Product[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Se está filtrando algo ou não */
  filtering = false;

  /** Se a página está listando os produtos de produção ou não */
  production = new BehaviorSubject<boolean>(false);

  /** Se trabalha com fotos nos produtos ou não */
  showProductImage: boolean;

  /** Se trabalha com contagem de estoque ou não */
  calculatesStock: boolean;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private produtosService: ProductsService, router: Router, private sideMenu: DcSideMenu,
              private authService: AuthService, acRoute: ActivatedRoute, private dialog: DcDialog) {

    super(acRoute, router);

    this.showProductImage = this.authService.getUserConfig()?.useProductImage;
    this.calculatesStock = this.authService.getUserConfig()?.calculateStock;

    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(event => {

        // Recuperamos se estamos filtrando os produtos de produção ou os normais
        const url = event.url;
        this.production = new BehaviorSubject(url.startsWith('/production'));

        // Carrega os produtos
        this.loadProducts();

      });

  }

  ngOnInit(): void {
  }

  filterProducts() {

    this.sideMenu.open(ProductsFilterComponent, {data: this.getFilter()}).afterClosed().pipe(takeUntil(this.unsub)).subscribe(result => {

      // Se o resultado do menu for `true`, devemos redefinir a busca, se não devemos
      // interpretar o result como um `FiltroProdutos` e realizar a busca
      if (result === true) {
        this.updateUrlFilter();
        return;
      }

      // Mesmo o resultado não sendo true, devemos verificar se o resultado foi definido
      // pois o sideMenu retorna undefined se ele for fechado pelo `dcSideMenuClose` ou um
      // clique no background
      const filterResult = result as ProductFilter;

      if (filterResult) {

        this.updateUrlFilter(filterResult);

      }

    });

  }

  /**
   * Abre a janela de categorias dos produtos
   */
  categories() {
    this.sideMenu.open(ProductsCategoriesComponent);
  }

  /**
   * Função trackBy dos produtos
   */
  productsTrackBy(index: number, item: Product) {
    return item.code;
  }

  ngOnDestroy(): void {
    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();
    this.newRequestUnsub.complete();
  }

  /**
   * Abre a visualização da foto do produto
   * @param product O produto selecionado para visualização
   */
  viewProductImage(product: Product) {

    if (!product.image?.f) {
      return;
    }

    this.dialog.open(ProductImageDlgComponent, {
      data: product,
      panelClass: 'product-picture-dialog'
    });

  }

  /**
   * Atualiza a url do filtro
   * @param params parâmetros para a atualização do filtro, se não informado, remove os filtros
   * @protected
   */
  protected updateUrlFilter(params?: ProductFilter): void {

    let filterParams: Params;
    filterParams = {
      page: 1,
      filter: params?.name,
      // Usamos um operador ternário nas verificações abaixo pois o operador de optional chaining ?.
      // não para a execução em 0 ou strings vazias
      categoryCode: params?.categoryCode ? params.categoryCode : undefined,
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
   * Carrega a lista de produtos
   */
  private loadProducts() {

    // Recuperando o filtro
    const productsFilter: ProductFilter = this.getFilter();
    this.filtering = !(!productsFilter.name && !productsFilter.categoryCode);

    this.status.next('carregando');
    this.produtosService.loadProducts(productsFilter).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe(response => {

      this.products.next(response);
      this.checkResults();

    }, () => {

      // Define como vazio
      this.status.next('vazio');

    });

  }

  private getFilter(): ProductFilter {

    // Recuperamos os parâmetros de filtro e verificamos qual o tipo dos produtos
    // devem ser carregados no componente
    const queryName = this.acRoute.snapshot.queryParamMap.get('filter');
    const queryCategoryCode = +this.acRoute.snapshot.queryParamMap.get('categoryCode');
    const queryPage = +this.acRoute.snapshot.queryParamMap.get('page');

    return {
      name: queryName,
      categoryCode: queryCategoryCode ? queryCategoryCode : undefined,
      page: queryPage ? queryPage : 1
    };

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults(): void {
    this.setNextPageDisabled(this.products.getValue().length < 50);
    this.status.next(this.products.getValue().length > 0 ? 'pronto' : 'vazio');
  }

}
