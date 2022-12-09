import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {ProductCategory} from '../../models/product-category';
import {ProductFilter} from '../../models/product-filter';
import {ProductsService} from '../../services/products.service';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'lpdv-products-filter',
  templateUrl: './products-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsFilterComponent implements OnInit, OnDestroy {

  /** Lista de categorias */
  categories = new BehaviorSubject<ProductCategory[]>([]);

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Formulário do filtro */
  filterForm = new FormGroup({
    name: new FormControl(''),
    categoryCode: new FormControl(''),
    sale: new FormControl(),
    catalogSale: new FormControl()
  });

  /** Se deve exibir os campos de integração do catálogo. */
  showCatalogIntegration: boolean;

  constructor(private produtosService: ProductsService, private layoutService: LayoutService,
              private sideMenuRef: DcSideMenuRef<ProductsFilterComponent>, @Inject(SIDE_MENU_DATA) public filter: ProductFilter,
              private authService: AuthService) {


    // Se existe algum filtro já utilizado, aplica seus valores no formulário
    this.filterForm.patchValue(this.filter);

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.setIntegrations();
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadCategories();
    });

  }

  /**
   * Fecha o menu retornando ao filtro informado
   * @param resetFilter Se deve redefinir o filtro ou não
   */
  filterProducts(resetFilter?: boolean) {

    // Fecha o menu
    this.sideMenuRef.close(resetFilter ? true : this.filterForm.getRawValue() as ProductFilter);

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

  ngOnDestroy(): void {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Define se exibe ou não os campos de integração baseado nas configurações do sistema.
   * @private
   */
  private setIntegrations(): void {

    const userConfig = this.authService.getUserConfig();
    this.showCatalogIntegration = userConfig?.catalogModule || false;

  }

  private loadCategories() {

    this.produtosService.loadCategories().pipe(takeUntil(this.unsub)).subscribe(response => {
      this.categories.next(response);
    });

  }

}
