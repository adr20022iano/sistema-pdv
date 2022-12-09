import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {ReportsService} from '../../services/reports.service';
import {takeUntil} from 'rxjs/operators';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {ProductsService} from '../../../products/services/products.service';
import {ProductCategory} from '../../../products/models/product-category';
import {LayoutService} from '../../../core/services/layout.service';
import {ProductsReportSettings} from '../../models/products/products-report-settings';
import {ProductsReportResponse} from '../../models/products/products-report-response';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'lpdv-stock-report',
  templateUrl: './products-report.component.html',
  styleUrls: ['./products-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsReportComponent implements OnInit, OnDestroy {

  /** Gerencia o cancelamento das inscrições do componente */
  unsub: Subject<any> = new Subject();

  /** FormGroup do relatório */
  reportForm = new FormGroup({
    orderBy: new FormControl(0),
    orderDesc: new FormControl(false),
    stockFilter: new FormControl(),
    stockFilterAsc: new FormControl({value: false, disabled: true}),
    categoryCode: new FormControl(),
    showCategory: new FormControl(true),
    showCost: new FormControl(true),
    showQuantity: new FormControl(true),
    showTotals: new FormControl(true),
    sale: new FormControl(),
    catalogSale: new FormControl(),
  });

  /** Lista de categorias dos produtos */
  productsCategories = new BehaviorSubject<ProductCategory[]>([]);

  /** Se está gerando o relatório ou não */
  creatingReport = new BehaviorSubject(false);

  /** Se deve exibir os campos de integração do catálogo. */
  readonly showCatalogIntegration: boolean;

  /** Worker usado para criar o relatório */
  private reportWorker: Worker;

  constructor(private sideMenuRef: DcSideMenuRef<ProductsReportComponent>, private reportsService: ReportsService,
              private snackBar: DcSnackBar, private productsService: ProductsService,
              private layoutService: LayoutService, private authService: AuthService) {

    this.showCatalogIntegration = this.authService?.getUserConfig().catalogModule || false;

  }

  /**
   * Retorna a label de disponibilidade de venda do produto
   */
  private static getSaleLabel(saleAvailability?: number): string {

    if (saleAvailability === 1) {
      return 'Apenas disponíveis para venda';
    } else if (saleAvailability === 2) {
      return 'Apenas indisponíveis para venda';
    }

    return 'Todos os produtos';

  }

  /**
   * Retorna a label de disponibilidade de venda no catálogo
   * @private
   */
  private getCatalogSaleLabel(catalogSale?: number): string {

    if (!this.showCatalogIntegration) {
      return '';
    }

    if (catalogSale === 1) {
      return 'Apenas disponíveis no catálogo';
    } else if (catalogSale === 2) {
      return 'Apenas indisponíveis no catálogo';
    }

    return 'Todos os produtos';

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadCategories();
    });
    this.registerListenerForInput(this.reportForm.get('stockFilter'), this.reportForm.get('stockFilterAsc'));
    this.registerCategoryChangesListener();

  }

  /**
   * Envia a requisição para gerar o relatório
   */
  generateReport() {

    if (this.reportForm.invalid) {
      return;
    }

    const formData = this.reportForm.getRawValue();
    const reportSettings: ProductsReportSettings = {
      ...formData,
      catalogSaleLabel: this.getCatalogSaleLabel(formData.catalogSale),
      saleLabel: ProductsReportComponent.getSaleLabel(formData.sale),
      selectedCategory: this.getCategoryName(formData.categoryCode || [])
    };
    this.reportForm.disable();
    this.creatingReport.next(true);
    this.reportsService.productsReport(formData).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Verifica se existem resultados no relatório
      if (response.list.length > 0) {
        this.createProductsReportWorker(response, reportSettings);
      } else {

        this.reportForm.enable();
        this.creatingReport.next(false);
        this.snackBar.open('Não existem resultados para o relatório.', null, {panelClass: 'sucesso', duration: 3500});

      }

    }, () => {

      this.creatingReport.next(false);
      this.reportForm.enable();

    });

  }

  ngOnDestroy() {

    // Cancela as inscrições dos Observables
    this.unsub.next();
    this.unsub.complete();
    this.reportWorker?.terminate();

  }

  /**
   * Retorna o nome das categorias selecionadas para gerar o relatório de produtos.
   * @param selectedCategories Array com os códigos das categorias.
   * @private
   */
  private getCategoryName(selectedCategories: number[]): string | undefined {

    if (selectedCategories.length === 0) {
      return 'Todas';
    } else if (selectedCategories.length === 1) {
      return this.productsCategories.getValue().find(category => category.code === selectedCategories[0]).name;
    }

    return undefined;

  }

  /**
   * Carrega a lista de categorias dos produtos
   */
  private loadCategories() {

    this.productsService.loadCategories().pipe(takeUntil(this.unsub)).subscribe((response) => {
      this.productsCategories.next(response);
    }, () => {
      this.sideMenuRef.close();
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
   * Registra para alterações no valor de um controlador, habilitando ou desabilitando
   * o controlador de destino.
   * @param origin Controlador que será monitorado.
   * @param dest Controlador que será habilitado ou desabilitado se existir um valor
   * presente no controlador de origem.
   * @private
   */
  private registerListenerForInput(origin: AbstractControl, dest: AbstractControl) {

    origin.valueChanges.pipe(takeUntil(this.unsub)).subscribe(value => {
      (value !== undefined && value !== null) ? dest.enable() : dest.disable();
    });

  }

  /**
   * Habilita ou desabilita o checkbox de categoria, conforme a seleção das categorias
   * @private
   */
  private registerCategoryChangesListener(): void {

    this.reportForm.get('categoryCode').valueChanges.pipe(takeUntil(this.unsub)).subscribe(value => {
      this.toggleCategoryCheckboxDisable(value?.length === 1);
    });

  }

  private toggleCategoryCheckboxDisable(disable: boolean): void {

    if (disable) {
      this.reportForm.get('showCategory').disable();
    } else {
      this.reportForm.get('showCategory').enable();
    }

  }

  /**
   * Inicializa o Worker para criação do relatório.
   * @param response A resposta do relatório.
   * @param settings As configurações do relatório.
   * @private
   */
  private createProductsReportWorker(response: ProductsReportResponse, settings: ProductsReportSettings): void {

    this.reportForm.enable();
    this.toggleCategoryCheckboxDisable(this.reportForm.get('categoryCode').value?.length === 1);

    this.reportWorker = new Worker('../../workers/products-report.worker', {
      type: 'module',
      name: 'ProductsReportWorker'
    });

    this.reportWorker.onmessage = ({data}) => {

      // O worker retorna a URL do arquivo, que abrimos na nova guia
      this.snackBar.open('Relatório gerado com sucesso', null, {panelClass: 'sucesso', duration: 3500});
      window.open(data);
      this.creatingReport.next(false);

    };

    this.reportWorker.postMessage([response, settings]);

  }

}
