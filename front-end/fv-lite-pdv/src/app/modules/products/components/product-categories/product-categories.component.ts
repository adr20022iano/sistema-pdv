import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {ProductCategory} from '../../models/product-category';
import {ProductsService} from '../../services/products.service';
import {Router} from '@angular/router';

@Component({
  selector: 'lpdv-fv-product-categories',
  templateUrl: './product-categories.component.html',
  styleUrls: ['./product-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsCategoriesComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** A lista das categorias */
  categories = new BehaviorSubject<ProductCategory[]>([]);

  constructor(private productsService: ProductsService, private sideMenuRef: DcSideMenuRef<ProductsCategoriesComponent>,
              private layoutService: LayoutService, private snackBar: DcSnackBar, private dialog: DcDialog,
              @Inject(SIDE_MENU_DATA) private returnCategory: boolean, private router: Router) {
  }

  ngOnInit(): void {

    this.initLayoutChanges();

    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadCategories();
    });

  }

  /** Função trackBy para a lista de categorias */
  categoriesTrackBy(index: number, item: ProductCategory) {
    return item.code;
  }

  /**
   * Filtra os produtos pela categoria informada
   * @param category Categoria selecionada para filtro
   */
  filterCategory(category: ProductCategory): void {

    this.sideMenuRef.close();
    this.router.navigate(['/products'], {queryParams: {categoryCode: category.code}}).then();

  }

  ngOnDestroy(): void {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Realiza a consulta das categorias
   */
  private loadCategories() {

    this.productsService.loadCategories().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.categories.next(response);
      this.checkResults();

    }, () => {
      this.status.next('vazio');
    });

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

  /**
   * Define a exibição da lista após o carregamento ou alguma operação
   */
  private checkResults() {
    this.status.next(this.categories.getValue().length > 0 ? 'pronto' : 'vazio');
  }

}
