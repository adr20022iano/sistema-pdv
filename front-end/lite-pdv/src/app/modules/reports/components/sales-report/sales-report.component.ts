import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Customer} from '../../../customers/models/customer';
import {debounceTime, filter, switchMap, takeUntil} from 'rxjs/operators';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {ReportsService} from '../../services/reports.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {LayoutService} from '../../../core/services/layout.service';
import {CustomersService} from '../../../customers/services/customers.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SalesReportSettings} from '../../models/sales/sales-report-settings';
import {AuthService} from '../../../core/services/auth.service';
import {SalesReportResponse} from '../../models/sales/sales-report-response';
import {CustomValidators} from '../../../shared/validators/custom-validators';
import {Product} from '../../../products/models/product';
import {ProductsService} from '../../../products/services/products.service';

@Component({
  selector: 'lpdv-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesReportComponent implements OnInit, OnDestroy {

  /** Lista do autocomplete de produtos */
  products: Observable<Product[]>;

  /** Lista do autocomplete de clientes */
  customers: Observable<Customer[]>;

  /** Gerencia o cancelamento das inscrições do componente */
  unsub: Subject<any> = new Subject();

  /** Formulário do relatório */
  reportForm = new FormGroup({
    paymentStatus: new FormControl(),
    customerCode: new FormControl('', [CustomValidators.objectKeyValidator('code')]),
    startDate: new FormControl(new Date(), Validators.required),
    endDate: new FormControl(new Date(), Validators.required),
    showProductsCost: new FormControl(true),
    showCustomerColumn: new FormControl(false),
    showSaleDate: new FormControl(true),
    showProfit: new FormControl(true),
    productCode: new FormControl('', CustomValidators.objectKeyValidator('code')),
    showSaleProfit: new FormControl(true)
  });

  /** Se o usuário tem acesso ao relatório completo */
  isAdim: boolean;

  /** Se está gerando o relatório ou não */
  creatingReport = new BehaviorSubject(false);

  /** Worker usado para criar o relatório */
  private reportWorker: Worker;

  constructor(private sideMenuRef: DcSideMenuRef<SalesReportComponent>, private reportsService: ReportsService,
              private snackBar: DcSnackBar, private customersService: CustomersService,
              private layoutService: LayoutService, private authService: AuthService,
              private productsService: ProductsService) {

    this.isAdim = authService.isAdmin();

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.initAutocompletes();

  }

  /**
   * Envia a requisição para gerar o relatório
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

    const reportSettings: SalesReportSettings = {
      customer: selectedCustomer,
      startDate: formData.startDate,
      endDate: formData.endDate,
      paymentStatusLabel: this.getPaymentStatusLabel(formData.paymentStatus),
      paymentStatus: formData.paymentStatus,
      showProfit: this.isAdim ? formData.showProfit : false,
      showProductsCost: this.isAdim ? formData.showProductsCost : false,
      showCustomerColumn: formData.showCustomerColumn,
      showSaleProfit: this.isAdim ? formData.showSaleProfit : false,
      showSaleDate: formData.showSaleDate
    };

    this.creatingReport.next(true);
    this.reportsService.salesReport(formData).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Verifica se existem resultados no relatório
      if (response.list.length > 0) {
        this.createSaleReportWorker(response, reportSettings);
      } else {

        this.reportForm.enable();
        this.creatingReport.next(false);
        this.snackBar.open('Não existem resultados para o relatório.', null, {panelClass: 'sucesso', duration: 3500});

      }

    }, () => {
      this.reportForm.enable();
    });

  }

  /**
   * Função usada para retornar o nome do cliente na exibição do autocomplete
   */
  dispCustomers(customers?: Customer) {
    return customers ? customers.name : undefined;
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

  ngOnDestroy() {

    // Cancela as inscrições dos Observables
    this.unsub.next();
    this.unsub.complete();
    this.reportWorker?.terminate();

  }

  /**
   * Retorna o label do status de pagamento selecionado para o relatório
   * @param paymentStatus Status do pagamento
   * @private
   */
  private getPaymentStatusLabel(paymentStatus: number) {

    const availablePaymentStatus = [
      {code: 1, label: 'Recebidas totalmente'},
      {code: 2, label: 'Recebimento superior'},
      {code: 3, label: 'Parcial / Não recebidas'}
    ];

    const selectedPaymentStatus = availablePaymentStatus.find(status => status.code === paymentStatus);
    return selectedPaymentStatus?.label;

  }

  /**
   * Inicializa os autocompletes
   */
  private initAutocompletes() {

    this.products = this.reportForm.get('productCode').valueChanges.pipe(
      debounceTime(200),
      filter(value => typeof value === 'string' && value.length >= 3),
      switchMap((filteredValue: string) => this.productsService.loadProducts({name: filteredValue, page: 1}))
    );

    // Filtramos os valores emitidos no input e realizamos a consulta no serviço de clientes com os valores filtrados
    this.customers = this.reportForm.get('customerCode').valueChanges.pipe(
      debounceTime(200),
      filter(value => typeof value === 'string' && value.length >= 3),
      switchMap((filteredValue: string) => this.customersService.getCustomers({name: filteredValue}))
    );

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
  private createSaleReportWorker(response: SalesReportResponse, settings: SalesReportSettings): void {

    this.reportForm.enable();

    this.reportWorker = new Worker('../../workers/sales-report.worker', {
      type: 'module',
      name: 'SalesReportWorker'
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
