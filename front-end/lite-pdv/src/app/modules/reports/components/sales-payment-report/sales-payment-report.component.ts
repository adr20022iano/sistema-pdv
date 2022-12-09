import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {Customer} from '../../../customers/models/customer';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {ReportsService} from '../../services/reports.service';
import {CustomersService} from '../../../customers/services/customers.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {LayoutService} from '../../../core/services/layout.service';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {SalesPaymentsReportSettings} from '../../models/sales-payments/sales-payments-report-settings';
import {SalesPaymentsReportResponse} from '../../models/sales-payments/sales-payments-report-response';
import {CustomValidators} from '../../../shared/validators/custom-validators';

@Component({
  selector: 'lpdv-sales-payment-report',
  templateUrl: './sales-payment-report.component.html',
  styleUrls: ['./sales-payment-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesPaymentReportComponent implements OnInit, OnDestroy {

  /** Lista de clientes do autocomplete */
  autocompleteCustomers = new BehaviorSubject<Customer[]>([]);

  /** Formulário do relatório */
  reportForm = new FormGroup({
    customerCode: new FormControl('', CustomValidators.objectKeyValidator('code')),
    type: new FormControl(),
    startDate: new FormControl(new Date(), Validators.required),
    endDate: new FormControl(new Date(), Validators.required)
  });


  /** Se está gerando o relatório ou não */
  creatingReport = new BehaviorSubject(false);

  /** Gerencia o cancelamento das inscrições do componente */
  private unsub: Subject<any> = new Subject();

  /** Worker usado para criar o relatório */
  private reportWorker: Worker;

  constructor(private sideMenuRef: DcSideMenuRef<SalesPaymentReportComponent>, private reportsService: ReportsService,
              private customersService: CustomersService, private snackBar: DcSnackBar, private layoutService: LayoutService) {
  }

  ngOnInit(): void {
    this.initLayoutChanges();
    this.initCustomersAutoComplete();
  }

  ngOnDestroy() {

    // Cancela as inscrições dos Observables
    this.unsub.next();
    this.unsub.complete();
    this.reportWorker?.terminate();

  }

  /**
   * Envia a requisição para gerar o relatório de recebimento das vendas
   */
  generateReport() {

    if (this.reportForm.invalid) {
      return;
    }

    const formData = this.reportForm.value;
    this.reportForm.disable();

    const selectedCustomer = formData.customerCode;
    formData.customerCode = selectedCustomer?.code;

    const reportSettings: SalesPaymentsReportSettings = {
      customer: selectedCustomer,
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type
    };

    this.creatingReport.next(true);
    this.creatingReport.next(true);
    this.reportsService.salesPaymentsReport(formData).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Verifica se existem resultados no relatório
      if (response.list.length > 0) {

        this.createSalesPaymentReportWorker(response, reportSettings);

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
   * Inicializa o autocomplete dos clientes
   */
  private initCustomersAutoComplete() {

    this.reportForm.get('customerCode').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      // Certifica-se de que está buscando uma string com 3 ou mais caracteres
      if (typeof value === 'string' && value.length >= 3) {

        // Realiza a consulta dos clientes sem distinção por cidade
        this.customersService.getCustomers({
          name: value,
          city: null
        }).pipe(takeUntil(this.unsub)).subscribe((response) => {

          const customers: Customer[] = response as unknown as Customer[];
          // Emite a resposta no behaviorSubject
          this.autocompleteCustomers.next(customers);

        });
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
  private createSalesPaymentReportWorker(response: SalesPaymentsReportResponse, settings: SalesPaymentsReportSettings): void {

    this.reportForm.enable();
    this.snackBar.open('Relatório gerado com sucesso', null, {panelClass: 'sucesso', duration: 3500});

    this.reportWorker = new Worker('../../workers/sales-payments-report.worker', {
      type: 'module',
      name: 'SalesPaymentsReportWorker'
    });

    this.reportWorker.onmessage = ({data}) => {

      // O worker retorna a URL do arquivo, que abrimos na nova guia
      window.open(data);
      this.creatingReport.next(false);

    };

    this.reportWorker.postMessage([response, settings]);

  }

}
