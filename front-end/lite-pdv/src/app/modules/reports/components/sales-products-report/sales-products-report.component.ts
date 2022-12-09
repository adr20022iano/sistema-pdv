import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Product} from '../../../products/models/product';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Customer} from '../../../customers/models/customer';
import {Seller} from '../../../sellers/models/seller';
import {CustomValidators} from '../../../shared/validators/custom-validators';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {ReportsService} from '../../services/reports.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {CustomersService} from '../../../customers/services/customers.service';
import {LayoutService} from '../../../core/services/layout.service';
import {SellersService} from '../../../sellers/services/sellers.service';
import {debounceTime, filter, switchMap, takeUntil} from 'rxjs/operators';
import {SalesProductsReportSettings} from '../../models/sale-products/sales-products-report-settings';
import {ProductsService} from '../../../products/services/products.service';
import {SalesProductsReportResponse} from '../../models/sale-products/sales-products-report-response';

@Component({
  selector: 'lpdv-sales-products-report',
  templateUrl: './sales-products-report.component.html',
  styleUrls: ['./sales-products-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesProductsReportComponent implements OnInit, OnDestroy {

  /** Lista do autocomplete de produtos */
  products: Observable<Product[]>;

  /** Lista do autocomplete de clientes */
  customers: Observable<Customer[]>;

  /** Lista de vendedores */
  sellers = new BehaviorSubject<Seller[]>([]);

  /** Formulário do relatório */
  reportForm = new FormGroup({
    customerCode: new FormControl('', [CustomValidators.objectKeyValidator('code')]),
    sellerCode: new FormControl(),
    showProductsCost: new FormControl(true),
    showProfit: new FormControl(true),
    showProductsProfit: new FormControl(true),
    showBarCode: new FormControl(true),
    productCode: new FormControl('', CustomValidators.objectKeyValidator('code')),
    startDate: new FormControl(new Date(), Validators.required),
    endDate: new FormControl(new Date(), Validators.required)
  });

  /** Label do título do relatório */
  title = 'Relatório de Produtos Vendidos';

  /** Se está gerando o relatório ou não */
  creatingReport = new BehaviorSubject(false);

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  /** Worker usado para criar o relatório */
  private reportWorker: Worker;

  constructor(private sideMenuRef: DcSideMenuRef<SalesProductsReportComponent>, private reportsService: ReportsService,
              private snackBar: DcSnackBar, private layoutService: LayoutService, private sellersService: SellersService,
              private customersService: CustomersService,
              private productsService: ProductsService) {
  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.loadSellers();
    this.registerAutocompletes();

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();
    this.reportWorker?.terminate();

  }

  /**
   * Função usada para retornar o nome do cliente na exibição do autocomplete
   */
  dispCustomers(customers?: Customer) {
    return customers ? customers.name : undefined;
  }

  /**
   * Função trackBy para a lista de vendedores
   */
  sellersTrackBy(index: number, seller: Seller) {
    return seller.code;
  }

  /**
   * Envia a requisição para gerar o relatório.
   */
  generateReport() {

    if (this.reportForm.invalid) {
      return;
    }

    const formData = this.reportForm.value;
    this.reportForm.disable();

    const selectedCustomer = formData.customerCode;
    formData.customerCode = selectedCustomer?.code;

    const selectedProduct = formData.productCode;
    formData.productCode = selectedProduct?.code;

    const reportSettings: SalesProductsReportSettings = {
      customer: selectedCustomer,
      startDate: formData.startDate,
      endDate: formData.endDate,
      seller: this.getSelectedSeller(formData.sellerCode),
      showProfit: formData.showProfit,
      showProductsCost: formData.showProductsCost,
      showProductsProfit: formData.showProductsProfit,
      showBarCode: formData.showBarCode
    };

    this.creatingReport.next(true);
    this.reportsService.saleProductsReport(formData).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Verifica se existem resultados no relatório
      if (response.list.length > 0) {

        this.createSaleProductsReportWorker(response, reportSettings);

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

  /**
   * Função usada para retornar o nome do produto
   * no input do autocomplete.
   */
  dispProducts(product?: Product) {
    return product ? product.name : undefined;
  }

  /**
   * Função trackBy para lista de produtos
   */
  productsTrackBy(index: number, item: Product) {
    return item.code;
  }

  /**
   * Recupera o nome do vendedor que foi selecionado para gerar o relatório
   * @param sellerCode Código do vendedor
   * @private
   */
  private getSelectedSeller(sellerCode: number) {

    if (sellerCode > 0) {
      const filteredSeller = this.sellers.getValue().find(seller => seller.code === sellerCode);
      return filteredSeller.code.toString().concat(' - ', filteredSeller.name);
    }

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
   * Realiza a consulta dos vendedores
   */
  private loadSellers() {

    this.sellersService.getSellers().pipe(takeUntil(this.unsub)).subscribe(response => {
      this.sellers.next(response);
    });

  }

  /**
   * Registra os autocompletes.
   * @private
   */
  private registerAutocompletes(): void {

    // Filtramos os valores emitidos no input e realizamos a consulta no serviço de clientes com os valores filtrados
    this.customers = this.reportForm.get('customerCode').valueChanges.pipe(
      debounceTime(200),
      filter(value => typeof value === 'string' && value.length >= 3),
      switchMap((filteredValue: string) => this.customersService.getCustomers({name: filteredValue}))
    );

    this.products = this.reportForm.get('productCode').valueChanges.pipe(
      debounceTime(200),
      filter(value => typeof value === 'string' && value.length >= 3),
      switchMap((filteredValue: string) => this.productsService.loadProducts({name: filteredValue, page: 1}))
    );

  }

  /**
   * Inicializa o Worker para criação do relatório.
   * @param response A resposta do relatório.
   * @param settings As configurações do relatório.
   * @private
   */
  private createSaleProductsReportWorker(response: SalesProductsReportResponse, settings: SalesProductsReportSettings): void {

    this.reportForm.enable();
    this.snackBar.open('Relatório gerado com sucesso', null, {panelClass: 'sucesso', duration: 3500});

    this.reportWorker = new Worker('../../workers/sales-products-report.worker', {
      type: 'module',
      name: 'SalesProductsReportWorker'
    });

    this.reportWorker.onmessage = ({data}) => {

      // O worker retorna a URL do arquivo, que abrimos na nova guia
      window.open(data);
      this.creatingReport.next(false);

    };

    this.reportWorker.postMessage([response, settings]);

  }

}
