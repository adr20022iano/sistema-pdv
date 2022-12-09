import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {ReportsService} from '../../services/reports.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {ProductsService} from '../../../products/services/products.service';
import {LayoutService} from '../../../core/services/layout.service';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Product} from '../../../products/models/product';
import {StockHandlingReportSettings} from '../../models/stock-handling/stock-handling-report-settings';
import {StockHandlingReportParams} from '../../models/stock-handling/stock-handling-report-params';
import {CustomValidators} from '../../../shared/validators/custom-validators';
import {StockHandlingReportResponse} from '../../models/stock-handling/stock-handling-report-response';

@Component({
  selector: 'lpdv-stock-handling-report',
  templateUrl: './stock-handling-report.component.html',
  styleUrls: ['./stock-handling-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockHandlingReportComponent implements OnInit, OnDestroy {

  /** Gerencia o cancelamento das inscrições do componente */
  unsub: Subject<any> = new Subject();

  /** Formulário do relatório */
  reportForm = new FormGroup({
    type: new FormControl([1, 2, 3, 4, 5], Validators.required),
    productCode: new FormControl('', CustomValidators.objectKeyValidator('code')),
    startDate: new FormControl(new Date(), Validators.required),
    endDate: new FormControl(new Date(), Validators.required)
  });

  /** Lista dos produtos no autocomplete */
  autoCompleteProducts = new BehaviorSubject<Product[]>([]);

  /** Se está gerando o relatório ou não */
  creatingReport = new BehaviorSubject(false);

  /** Worker usado para criar o relatório */
  private reportWorker: Worker;

  constructor(private sideMenuRef: DcSideMenuRef<StockHandlingReportComponent>, private reportsService: ReportsService,
              private snackBar: DcSnackBar, private productsService: ProductsService,
              private layoutService: LayoutService) {

  }

  ngOnInit(): void {
    this.initLayoutChanges();
    this.initProductsAutoComplete();
  }

  /**
   * Envia a requisição para gerar o relatório
   */
  generateReport() {

    if (this.reportForm.invalid) {
      return;
    }

    const formData = this.reportForm.value;
    const selectedProduct = formData.productCode;
    formData.productCode = selectedProduct?.code;
    this.reportForm.disable();
    this.creatingReport.next(true);

    this.reportsService.stockHandlingReport(formData).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Verifica se existem resultados no relatório
      if (response.list.length > 0) {
        this.createStockHandlingWorker(response, this.getReportSettings(formData, selectedProduct));
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
   * Função usada para retornar o nome do produto
   * no input do autocomplete.
   */
  dispProducts(product?: Product) {
    return product ? product.name : undefined;
  }

  /**
   * Retorna as configurações do relatório para impressão.
   * @param params Parâmetros usados para gerar o relatório.
   * @param selectedProduct O produto selecionado para o filtro
   * @private
   */
  private getReportSettings(params: StockHandlingReportParams, selectedProduct: { name: string; code: number }) {

    const availableOperations = [
      {code: 1, label: 'Entradas'},
      {code: 2, label: 'Saídas'},
      {code: 3, label: 'Perdas'},
      {code: 4, label: 'Vendas'},
      {code: 5, label: 'Produção'},
      {code: 6, label: 'Transferências'}
    ];

    const operations = availableOperations.filter(option => params.type.indexOf(option.code) > -1)
      .map(filteredOption => filteredOption.label).join(', ');

    const reportSettings: StockHandlingReportSettings = {
      handlingOperations: operations, startDate: params.startDate, endDate: params.endDate,
      product: selectedProduct
    };

    return reportSettings;

  }

  /**
   * Inicializa o autocomplete dos produtos
   */
  private initProductsAutoComplete() {

    this.reportForm.get('productCode').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      // Certifica-se de que está buscando uma string com 3 ou mais caracteres
      if (typeof value === 'string' && value.length >= 3) {
        this.productsService.loadProducts({
          name: value,
          page: 1
        }).pipe(takeUntil(this.unsub)).subscribe((response) => {
          this.autoCompleteProducts.next(response);
        });
      } else if (typeof value === 'string' && value.length === 0) {
        this.autoCompleteProducts.next([]);
      }

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
   * Inicializa o Worker para criação do relatório.
   * @param response A resposta do relatório.
   * @param settings As configurações do relatório.
   * @private
   */
  private createStockHandlingWorker(response: StockHandlingReportResponse, settings: StockHandlingReportSettings): void {

    this.reportForm.enable();
    this.snackBar.open('Relatório gerado com sucesso', null, {panelClass: 'sucesso', duration: 3500});

    this.reportWorker = new Worker('../../workers/stock-handling-report.worker', {
      type: 'module',
      name: 'StockHandlingReportWorker'
    });

    this.reportWorker.onmessage = ({data}) => {

      // O worker retorna a URL do arquivo, que abrimos na nova guia
      window.open(data);
      this.creatingReport.next(false);

    };

    this.reportWorker.postMessage([response, settings]);

  }

}
