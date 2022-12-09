import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {ReportsService} from '../../services/reports.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {CashBookService} from '../../../cash-book/services/cash-book.service';
import {LayoutService} from '../../../core/services/layout.service';
import {takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Subject} from 'rxjs';
import {BookCategory} from '../../../cash-book/models/book-category';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CashBookReportParams} from '../../models/cash-book/cash-book-report-params';
import {CashBookReportSettings} from '../../models/cash-book/cash-book-report-settings';
import {CashBookReportResponse} from '../../models/cash-book/cash-book-report-response';

@Component({
  selector: 'lpdv-cash-book-report',
  templateUrl: './cash-book-report.component.html',
  styleUrls: ['./cash-book-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashBookReportComponent implements OnInit, OnDestroy {

  /** Gerencia o cancelamento das inscrições do componente */
  unsub: Subject<any> = new Subject();

  /** Lista de categorias dos caixas */
  cashBookCategories = new BehaviorSubject<BookCategory[]>([]);

  /** FormGroup do relatório */
  reportForm = new FormGroup({
    categoryCode: new FormControl([], Validators.required),
    startDate: new FormControl(new Date(), Validators.required),
    endDate: new FormControl(new Date(), Validators.required)
  });

  /** Se está gerando o relatório ou não */
  creatingReport = new BehaviorSubject(false);

  /** Worker usado para criar o relatório */
  private reportWorker: Worker;

  constructor(private sideMenuRef: DcSideMenuRef<CashBookReportComponent>, private reportsService: ReportsService,
              private snackBar: DcSnackBar, private cashBookService: CashBookService, private layoutService: LayoutService) {
  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadCategories();
    });

  }

  /**
   * Envia a requisição para gerar o relatório
   */
  generateReport() {

    const formData = this.reportForm.value;
    this.creatingReport.next(true);
    this.reportForm.disable();
    this.reportsService.cashBookReport(formData).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Verifica se existem resultados no relatório
      if (response.list.length > 0) {

        this.createCashBookReportWorker(response, this.getReportSettings(formData));

      } else {

        this.reportForm.enable();
        this.creatingReport.next(false);
        this.snackBar.open('Não existem resultados para o relatório', null, {panelClass: 'sucesso', duration: 3500});

      }

    }, () => {
      this.reportForm.enable();
      this.creatingReport.next(false);
    });

  }

  ngOnDestroy() {

    // Cancela as inscrições dos Observables
    this.unsub.next();
    this.unsub.complete();
    this.reportWorker?.terminate();

  }

  /**
   * Retorna as configurações do relatório para impressão.
   * @param params Parâmetros usados para gerar o relatório.
   * @private
   */
  private getReportSettings(params: CashBookReportParams) {

    const categories = this.cashBookCategories.getValue().filter(category => params.categoryCode.indexOf(category.code) > -1)
      .map(filteredCategory => filteredCategory.name).join(', ');

    const reportSettings: CashBookReportSettings = {
      selectedCategories: categories,
      startDate: params.startDate,
      endDate: params.endDate
    };

    return reportSettings;

  }

  /**
   * Carrega a lista de caixas e suas categorias dos lançamentos
   */
  private loadCategories() {

    this.cashBookService.loadCategories().pipe(takeUntil(this.unsub)).subscribe((response) => {

      this.cashBookCategories.next(response);
      const codes = response.map(category => category.code);
      this.reportForm.get('categoryCode').setValue(codes);

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
   * Inicializa o Worker para criação do relatório.
   * @param response A resposta do relatório.
   * @param settings As configurações do relatório.
   * @private
   */
  private createCashBookReportWorker(response: CashBookReportResponse, settings: CashBookReportSettings): void {

    this.reportForm.enable();
    this.reportWorker = new Worker('../../workers/cash-book-report.worker', {
      type: 'module',
      name: 'CashBookReportWorker'
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
