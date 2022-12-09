import {ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Params, Router, RouterEvent} from '@angular/router';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {Product} from '../../models/product';
import {ProductFilter} from '../../models/product-filter';
import {PRODUCT_TYPE} from '../../models/product-type.enum';
import {ProductsService} from '../../services/products.service';
import {UpdateSaleValueComponent} from '../update-sale-value/update-sale-value.component';
import {ProductsCategoriesComponent} from '../product-categories/product-categories.component';
import {ProductsFilterComponent} from '../products-filter/products-filter.component';
import {NewStockHandlingComponent, NewStockHandlingData} from '../new-stock-handling/new-stock-handling.component';
import {NewProductComponent} from '../new-product/new-product.component';
import {ProductProductionComponent} from '../product-production/product-production.component';
import {HasPaginationDirective} from '../../../shared/directives/has-pagination.directive';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {ProductImageDlgComponent} from '../../../shared/components/product-image-dlg/product-image-dlg.component';
import {HeaderMenuItem} from '../../../shared/components/header-menu/header-menu-item';
import {ScaleExportComponent} from '../scale-export/scale-export.component';

@Component({
  selector: 'lpdv-products',
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

  /** Se o usuário do sistema é administrador ou não */
  isAdmin = false;

  /** Se a página está listando os produtos de produção ou não */
  production = new BehaviorSubject<boolean>(false);

  /** Se trabalha com fotos nos produtos ou não */
  showProductImage: boolean;

  /** Se trabalha com contagem de estoque ou não */
  calculatesStock: boolean;

  /** Código do produto que deve ser focado após carregamento da lista */
  focusCode: number;

  /** Opções do menu */
  menuOptions: HeaderMenuItem[];

  /** Se usa o módulo de vendas externas ou não */
  externalSalesModule: boolean;

  /** Se trabalha com o módulo de produção ou não */
  showProductProduction: boolean;

  /** Se janela de adicionar está aberta */
  private addMenuOpen: boolean;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private produtosService: ProductsService, router: Router, private sideMenu: DcSideMenu,
              private authService: AuthService, acRoute: ActivatedRoute, private dialog: DcDialog) {

    super(acRoute, router);

    this.isAdmin = this.authService.isAdmin();
    const userConfig = this.authService.getUserConfig();
    this.showProductImage = userConfig?.useProductImage;
    this.calculatesStock = userConfig?.calculateStock;
    this.externalSalesModule = userConfig?.externalSalesModule;
    this.showProductProduction = userConfig?.useProduction;

    // Recuperamos se estamos filtrando os produtos de produção ou os normais
    const url = this.router.url;
    this.production = new BehaviorSubject(url.startsWith('/production'));

    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        // Carrega os produtos
        this.loadProducts();

      });

    this.setHeadersOptions();

  }

  ngOnInit(): void {
  }

  /**
   * Abre a janela para adicionar um novo produto
   */
  @HostListener('document:keydown.F2')
  newProduct = () => {

    if (!this.isAdmin || this.addMenuOpen) {
      return;
    }

    this.addMenuOpen = true;
    this.sideMenu.open(NewProductComponent, {
      data: {
        production: this.production.getValue(),
        product: undefined
      },
      autoFocus: false
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((shouldReload: boolean) => {

      this.addMenuOpen = false;
      if (shouldReload) {
        this.loadProducts();
      }

    });

  };

  /**
   * Abre a janela para editar um produto.
   * @param productIndex Index do produto na listagem.
   * @param editionProduct O produto selecionado para edição.
   * @param duplicate Se o produto deve ser duplicado ou não.
   */
  editProduct(productIndex: number, editionProduct: Product, duplicate?: boolean) {

    // Abre o side menu para edição
    const editProductSideMenu = this.sideMenu.open(NewProductComponent, {
      data: {product: editionProduct, production: this.production.getValue(), duplicate}, autoFocus: false
    });

    editProductSideMenu.afterClosed().pipe(takeUntil(this.unsub)).subscribe((shouldReload: boolean) => {

      if (shouldReload) {
        this.loadProducts();
      }

    });

  }

  /**
   * Abre a janela para editar o valor de um produto.
   * @param productIndex Index do produto na listagem.
   * @param product O produto selecionado para edição.
   */
  editSaleValue(productIndex: number, product: Product) {

    this.sideMenu.open(UpdateSaleValueComponent, {data: product, autoFocus: false})
      .afterClosed().subscribe((result: number[]) => {

      if (result) {

        const newSaleValue = result[0];
        const newExternalSaleValue = result[1];

        const updatedProduct = Object.assign({}, {
          ...product,
          value: newSaleValue,
          externalSaleValue: newExternalSaleValue
        });
        const currentProducts = this.products.getValue();
        currentProducts.splice(productIndex, 1, updatedProduct);
        this.products.next(currentProducts);

      }

    });

  }

  /**
   * Abre a janela para editar o estoque de um produto.
   * @param productIndex Index do produto na listagem.
   * @param editionProduct O produto selecionado para edição.
   */
  editStock(productIndex: number, editionProduct: Product) {

    const editStockData: NewStockHandlingData = {product: editionProduct, production: this.production.getValue()};
    this.sideMenu.open(NewStockHandlingComponent, {data: editStockData, autoFocus: false})
      .afterClosed().subscribe((newStock: number) => {

      if (Number.isFinite(newStock)) {

        const updatedProduct = Object.assign({}, {...editionProduct, stock: newStock});
        const currentProducts = this.products.getValue();
        currentProducts.splice(productIndex, 1, updatedProduct);
        this.products.next(currentProducts);

      }

    });

  }

  /**
   * Abre a janela para editar a composição de um produto de produção.
   * @param product O produto selecionado para edição.
   */
  editProduction(product: Product) {

    this.sideMenu.open(ProductProductionComponent, {
      data: product,
      autoFocus: false
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe(result => {

      if (result === true) {
        this.loadProducts();
      }

    });

  }

  /**
   * Abre o menu de filtrar produtos
   */
  filterProducts = () => {

    this.sideMenu.open(ProductsFilterComponent, {data: this.getFilter(), autoFocus: false}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe(result => {

      // Se o resultado do menu for true, devemos redefinir a busca, se não devemos
      // interpretar o resultado como um FiltroProdutos e realizar a busca
      if (result === true) {
        this.updateUrlFilter();
        return;
      }

      // Mesmo o resultado não sendo true, devemos verificar se o resultado foi definido,
      // pois, o sideMenu retorna undefined se ele for fechado pelo dcSideMenuClose ou um
      // clique no background
      const filterResult = result as ProductFilter;

      if (filterResult) {

        this.updateUrlFilter(filterResult);

      }

    });

  };

  /**
   * Abre a janela de categorias dos produtos
   */
  categories = () => {
    this.sideMenu.open(ProductsCategoriesComponent, {autoFocus: false});
  };

  /**
   * Abre a janela de exportação dos produtos de balança
   * @private
   */
  private scaleProducts(): void {
    this.sideMenu.open(ScaleExportComponent);
  }

  /**
   * Label de filtro para o menu do cabeçalho
   */
  get filterLabel(): string {
    return this.filtering ? 'Exibindo produtos filtrados em ordem alfabética' : 'Exibindo produtos em ordem de maior relevância';
  }

  /**
   * Abre a visualização da foto do produto
   * @param product
   */
  openImage(product: Product): void {

    if (!product.image?.f) {
      return;
    }

    this.dialog.open(ProductImageDlgComponent, {data: product, panelClass: 'product-picture-dialog'});

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
   * Atualiza a url do filtro
   * @param params parâmetros para a atualização do filtro, se não informado, remove os filtros
   * @protected
   */
  protected updateUrlFilter(params?: ProductFilter): void {

    let filterParams: Params;
    filterParams = {
      page: 1,
      filter: params?.name,
      // Usamos um operador ternário nas verificações abaixo, pois o operador de optional chaining
      // não para a execução em 0 ou strings vazias
      categoryCode: params?.categoryCode ? params.categoryCode : undefined,
      sale: params?.sale ? params.sale : undefined,
      catalogSale: params?.catalogSale ? params.catalogSale : undefined
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

    // Antes de carregar os produtos recuperamos o código do produto que deve ser focado após a lista ser carregada
    this.focusCode = this.produtosService.getFocusTarget();

    // Recuperando o filtro
    const productsFilter: ProductFilter = this.getFilter();
    this.filtering = !(!productsFilter.name && !productsFilter.categoryCode && !productsFilter.sale && !productsFilter.catalogSale);

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
    const querySale = +this.acRoute.snapshot.queryParamMap.get('sale');
    const catalogSale = +this.acRoute.snapshot.queryParamMap.get('catalogSale');

    return {
      name: queryName,
      categoryCode: queryCategoryCode ? queryCategoryCode : undefined,
      sale: querySale,
      page: queryPage ? queryPage : 1,
      production: this.production.getValue() ? PRODUCT_TYPE.PRODUCTION : PRODUCT_TYPE.NORMAL,
      catalogSale
    };

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults(): void {
    this.setNextPageDisabled(this.products.getValue().length < 50);
    this.status.next(this.products.getValue().length > 0 ? 'pronto' : 'vazio');
  }

  /**
   * Define os itens do header.
   * @private
   */
  private setHeadersOptions(): void {

    const itens: HeaderMenuItem[] = [];
    if (this.isAdmin) {
      const label = this.production.getValue() ? 'Novo produto de produção' : 'Novo produto';
      itens.push({label, icon: 'add', shortcut: 'F2', onClick: this.newProduct});
    }

    itens.push({label: 'Filtrar', icon: 'search', onClick: this.filterProducts});
    if (this.showProductProduction && !this.production.getValue()) {
      itens.push({label: 'Produtos de produção', icon: 'precision_manufacturing', url: '/production'});
    }

    if (this.isAdmin) {
      itens.push({label: 'Categorias', icon: 'bookmark', onClick: this.categories});

      if (this.authService.getUserConfig().scaleIntegration) {
        itens.push({label: 'Exportação para balança', icon: 'scale', onClick: this.scaleProducts.bind(this)});
      }

    }

    this.menuOptions = itens;

  }

}
