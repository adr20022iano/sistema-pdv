import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ProductsService} from '../../services/products.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {FeaturedCategory} from '../../models/featured-category';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {Product} from '../../models/product';
import {ProductDetailsComponent} from '../product-details/product-details.component';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {LoaderStatus} from '@shared/models/loader-status';
import {Title} from '@angular/platform-browser';
import {catalogParams} from '@core/catalog-params';
import {Platform} from '@angular/cdk/platform';

@Component({
  selector: 'clpdv-featured',
  templateUrl: './featured-products.component.html',
  styleUrls: ['./featured-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedProductsComponent implements OnInit, OnDestroy {

  /** Lista de categorias destacadas */
  featuredCategories = new BehaviorSubject<FeaturedCategory[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('loading');

  /** Emite um evento quando o componente é destruído para cancelar quaisquer inscrições de observables */
  private readonly unsub = new Subject<void>();

  /** Se a plataforma atual é mobile ou não */
  private readonly isMobile: boolean;

  constructor(private productsService: ProductsService, private router: Router, private sideMenu: DcSideMenu, private title: Title,
              private platForm: Platform) {

    this.isMobile = platForm.IOS || platForm.ANDROID;
    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        this.loadFeaturedProducts();
        this.title.setTitle(catalogParams.defaultTile);

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
   * @param event Evento emitido pelo componente da categoria.
   * @param category A categoria onde o produto foi selecionado.
   * @param categoryIndex O índice da categoria na listagem.
   */
  showProductDetails(event: { product: Product, productIndex: number }, category: FeaturedCategory, categoryIndex: number): void {

    this.sideMenu.open(ProductDetailsComponent, {data: event.product, autoFocus: !this.isMobile}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((result) => {

        // Ao adicionar um produto no carrinho, o menu retorna true,
        // então atualizamos os produtos na categoria
        if (result) {

          // Recuperamos e atualizamos a lista de produtos da categoria
          const currentProducts = category.products;
          const newProduct = Object.assign({}, event.product);
          currentProducts.splice(event.productIndex, 1, newProduct);
          category.products = currentProducts;

          // E atualizamos também a categoria
          const updatedCategory = Object.assign({}, category);
          const currentCategories = this.featuredCategories.getValue();
          currentCategories.splice(categoryIndex, 1, updatedCategory);
          this.featuredCategories.next(currentCategories);

        }

      });

  }

  /**
   * Função trackBy para a lista de categorias
   */
  featuredCategoriesTrackBy(index: number, item: FeaturedCategory): number {
    return item.code;
  }

  /**
   * Carrega a lista de produtos destacados
   * @private
   */
  loadFeaturedProducts(): void {

    this.status.next('loading');
    this.productsService.getFeaturedProducts().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.featuredCategories.next(response);
      this.status.next(response.length > 0 ? 'done' : 'empty');

    }, () => {
      this.status.next('error');
    });

  }

}
