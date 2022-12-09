import {ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Params, Router, RouterEvent} from '@angular/router';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {DateHelper} from 'src/app/modules/shared/helpers/date-helper';
import {SalesFilter} from '../../models/sales-filter';
import {Sale} from '../../models/sale';
import {PosService} from '../../services/pos.service';
import {SalesFilterComponent} from '../sales-filter/sales-filter.component';
import {SalePaymentsComponent} from './sale-payments/sale-payments.component';
import {PrintService} from 'src/app/modules/core/services/print.service';
import {HasPaginationDirective} from '../../../shared/directives/has-pagination.directive';
import {ShareHelperService} from '../../../shared/helpers/share-helper';
import {SaleForPrint} from '../../models/sale-for-print';
import {PdfHelper, PdfTableColumn} from '../../../shared/helpers/pdf-helper';
import {Platform} from '@angular/cdk/platform';
import {UserOptions} from 'jspdf-autotable';

@Component({
  selector: 'lpdv-fv-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesComponent extends HasPaginationDirective<SalesFilter> implements OnInit, OnDestroy {

  /** Se o usuário do sistema é administrador ou não */
  canDeleteSales = false;

  /** As vendas exibidas na página */
  sales = new BehaviorSubject<Sale[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Controla o status de desabilitado dos botões da paginação */
  previousPageDisabled = true;
  nextPageDisabled = true;

  /** Código da venda que deve ser focada após carregamento da lista */
  focusCode: number;

  /** Se o módulo de catálogo está habilitado */
  catalogModule: boolean;

  /** Se o módulo de força de vendas está habilitado */
  externalSalesModule: boolean;

  /** Se está filtrando vendas normais ou orçamentos */
  filteringQuotes: boolean;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  /** A página atual */
  private page = 1;

  /** Regex usada para filtrar eventos do Router no outlet de impressão */
  private printRegex = /\(print:sale-receipt\/\d*\)/;

  constructor(private posService: PosService, router: Router, private sideMenu: DcSideMenu, private authService: AuthService,
              route: ActivatedRoute, private dialog: DcDialog, private snackBar: DcSnackBar, private printService: PrintService,
              private shareHelper: ShareHelperService, private platform: Platform) {

    super(route, router);

    // Filtramos os eventos de NavigationEnd que não ocorrem no outlet de impressão para poder carregar as vendas
    this.router.events.pipe(
      filter((event: RouterEvent) => (event instanceof NavigationEnd && !this.printRegex.test(event.urlAfterRedirects))),
      takeUntil(this.unsub)).subscribe((event) => {

      // Recuperamos se estamos filtrando pedidos normais ou orçamentos
      const url = event.url;
      this.filteringQuotes = url.startsWith('/quotes');
      this.loadSales();

    });

  }

  /**
   * Retorna a label exibida no placeholder
   */
  get placeholderLabel(): string {
    return this.filteringQuotes ? 'Nenhum orçamento encontrado' : 'Nenhuma venda encontrada';
  }

  /**
   * Retorna a tabela de rodapé da venda/orçamento
   * @param response A resposta da consulta
   * @param isQuote Se está compartilhando um orçamento
   * @private
   */
  private static getSaleFooter(response: SaleForPrint, isQuote: boolean): UserOptions {

    const header = [];
    const line = [];

    // Adiciona o desconto
    if (response.discount) {
      header.push(
        {content: 'Desconto', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}}
      );
      line.push({content: response.discount, styles: {fontStyle: 'bold', halign: 'right'}});
    }

    // Adiciona o frete
    if (response.shipping) {
      header.push(
        {content: 'Frete', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}}
      );
      line.push({content: response.shipping, styles: {fontStyle: 'bold', halign: 'right'}});
    }

    // Se é uma venda, adiciona o valor pago, restante, e troco
    if (!isQuote) {
      header.push(
        {content: 'Valor pago', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}}
      );
      line.push({content: response.paidValue, styles: {fontStyle: 'bold', halign: 'right'}});

      header.push(
        {content: 'Restante', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}}
      );
      line.push({content: response.unpaidValue, styles: {fontStyle: 'bold', halign: 'right'}});

      header.push(
        {content: 'Restante', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}}
      );
      line.push({content: response.unpaidValue, styles: {fontStyle: 'bold', halign: 'right'}});

      header.push(
        {content: 'Troco', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}}
      );
      line.push({content: response.saleChange, styles: {fontStyle: 'bold', halign: 'right'}});

    }

    // Adiciona o total
    header.push(
      {
        content: isQuote ? 'Total do orçamento' : 'Total da venda',
        styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}
      }
    );
    line.push({content: response.saleTotal, styles: {fontStyle: 'bold', halign: 'right'}});

    return {
      body: [header, line]
    };

  }

  ngOnInit(): void {

  }

  /**
   * Abre o menu de lançamentos financeiros da venda.
   * @param saleIndex O index da venda na listagem.
   * @param sale A venda selecionada.
   */
  salePayments(saleIndex: number, sale: Sale) {
    this.sideMenu.open(SalePaymentsComponent, {data: sale});
  }

  /**
   * Realiza a requisição dos dados de uma venda para compartilhamento
   * @param sale A venda com todos seus dados para compartilhamento
   */
  getSaleForShare(sale: Sale) {

    // Consulta a venda ou orçamento para impressão
    if (this.filteringQuotes) {

      this.posService.getQuoteForPrint(sale.code).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe((response => {
        this.shareSale(response, true);
      }));

    } else {

      this.posService.getSaleForPrint(sale.code).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe((response => {
        this.shareSale(response);
      }));

    }


  }

  /**
   * Abre a página de nova venda
   */
  newSale() {
    this.router.navigate(['/sales/new-sale']).then();
  }

  /**
   * Realiza a impressão da venda.
   * @param sale A venda selecionada para impressão.
   */
  printSale(sale: Sale) {
    this.printService.printSale(sale.code);
  }

  /**
   * Abre o menu para filtrar as vendas
   */
  filterSales() {

    this.sideMenu.open(SalesFilterComponent, {data: this.getFilter()}).afterClosed().pipe(takeUntil(this.unsub)).subscribe(result => {

      // Se o resultado do menu for `true`, devemos redefinir a busca, se não devemos
      // interpretar o result como um `FiltroProdutos` e realizar a busca
      if (result === true) {
        this.updateUrlFilter(null);
        return;
      }

      // Mesmo o resultado não sendo true, devemos verificar se o resultado foi definido
      // pois o sideMenu retorna undefined se ele for fechado pelo `dcSideMenuClose` ou um
      // clique no background
      const filterResult = result as SalesFilter;

      if (filterResult) {
        this.updateUrlFilter(filterResult);
      }

    });

  }

  /**
   * HostListener para os eventos de keyup na tecla F2 na página
   */
  @HostListener('document:keydown.F2') onKeyDown() {
    this.newSale();
  }

  /** Função trackBy da lista de vendas */
  salesTrackBy(index: number, sale: Sale) {
    return sale.code;
  }

  ngOnDestroy(): void {

    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Atualiza a url do filtro
   * @param params parâmetros para a atualização do filtro, se não informado, remove os filtros
   * @protected
   */
  protected updateUrlFilter(params?: SalesFilter): void {

    let filterParams: Params;
    if (params?.codeObservation) {
      filterParams = {codeObservation: params.codeObservation, page: 1};
    } else {

      filterParams = {
        page: 1,
        codeObservation: params?.codeObservation ? params.codeObservation : undefined,
        customerCode: params?.customerCode ? params.customerCode : undefined,
        paymentStatus: params?.paymentStatus ? params.paymentStatus : undefined,
        date: params?.date ? DateHelper.dateToString(params.date) : undefined,
        locked: params?.locked
      };

    }

    // Navegamos para a mesma rota atualizando os parâmetros de busca, que faz com que a inscrição dos eventos do
    // router carregue a lista novamente.
    this.router.navigate([], {
      relativeTo: this.acRoute,
      queryParams: filterParams,
      queryParamsHandling: params?.codeObservation ? undefined : 'merge',
    }).then();

  }

  /**
   * Compartilha a venda selecionada.
   * @param sale A venda com todos seus dados para compartilhamento.
   * @param isQuote Se a venda compartilhada é um orçamento.
   */
  private shareSale(sale: SaleForPrint, isQuote?: boolean) {

    const receipt = new PdfHelper();
    const title = (isQuote ? 'ORÇAMENTO #' : 'VENDA #').concat(sale.code.toString());
    receipt.createA4Receipt(title, sale.date, sale.print?.fantasyName);

    // Adiciona as informações extras da empresa
    if (sale.print) {

      const printInfo = sale.print;

      if (printInfo.phone || printInfo.document) {
        const label = ''.concat(printInfo.phone || '', printInfo.phone ? ' ' : '', printInfo.document || '');
        receipt.addText(label);
      }

      const companyAddressLine1 = printInfo.address?.concat(printInfo.number ? ', ' : '', printInfo.number || '');
      const companyAddressLine2 = printInfo.district?.concat(printInfo.city ? ', ' : '', printInfo.city || '');

      if (companyAddressLine1) {
        receipt.addText(companyAddressLine1);
      }

      if (companyAddressLine2) {
        receipt.addText(companyAddressLine2);
      }

    }

    // Informa a observação da venda
    if (sale.observation) {
      receipt.increaseYPos(4);
      receipt.addParam('OBSERVAÇÃO', sale.observation, receipt.xPos, receipt.yPos);
    }

    // Informa o vendedor
    if (sale.seller) {
      receipt.increaseYPos(4);
      receipt.addParam('VENDEDOR', sale.seller.code.toString().concat(' • ', sale.seller.name), receipt.xPos, receipt.yPos);
    }

    // Definição das colunas da tabela
    const productsColumnDef: PdfTableColumn[] = [
      {header: 'Código', dataKey: 'code'},
      {header: 'Produto', dataKey: 'name'},
      {header: 'Quantidade', dataKey: 'quantity'},
      {header: 'Valor', dataKey: 'value'},
      {header: 'Subtotal', dataKey: 'subtotal'}
    ];


    // Estilos de customização das colunas
    const rightAlign = {halign: 'right'} as const;
    const centerAlign = {halign: 'center'} as const;
    const productsColumnStyles = {
      code: centerAlign,
      value: rightAlign,
      subtotal: rightAlign,
      quantity: rightAlign
    };

    // Definição do footer da tabela
    const productsFooter = [
      [
        {
          content: 'Total de produtos',
          colSpan: 2,
          styles: rightAlign,
        },
        {
          content: sale.itemsTotal,
          styles: rightAlign
        },
        {
          content: sale.productsTotal,
          colSpan: 2,
          styles: rightAlign
        }
      ]
    ];

    receipt.addTable(productsColumnDef, sale.products, productsFooter, productsColumnStyles);
    receipt.addLine();
    receipt.addTableImproved(SalesComponent.getSaleFooter(sale, isQuote));
    receipt.addText('* Este documento não tem validade fiscal.', 5);
    receipt.addText('Gerado em '.concat(DateHelper.dateToFormattedString(new Date(), 'dd/MM/yyyy HH:mm')), 5);
    receipt.addText('Lite PDV • www.devap.com.br', 5);

    if (this.platform.IOS || this.platform.ANDROID) {
      const shareTitle = (isQuote ? 'Orçamento ' : 'Venda ').concat(sale.code.toString());
      this.sharePDF(receipt.toFile(shareTitle.concat('.pdf')), shareTitle);
    } else {
      receipt.openInNewTab();
    }

  }

  /**
   * Compartilha o arquivo PDF informado
   * @param pdfFile O arquivo pdf
   * @param shareTitle O título para a janela de compartilhamento
   * @private
   */
  private sharePDF(pdfFile: File, shareTitle: string): void {

    if (!this.shareHelper.supportsShare() || !this.shareHelper.canShareFile([pdfFile])) {
      console.error('Não é possível compartilhar arquivos');
      return;
    }

    this.shareHelper.share({
      title: shareTitle,
      text: 'Compartilhar '.concat(shareTitle),
      files: [pdfFile]
    }).then(result => {
      console.log('Venda compartilhada', result);
    });

  }

  /**
   * Define os valores do filtro
   */
  private getFilter(): SalesFilter {

    // Recuperamos os parâmetros de filtro
    const queryCodeObs = this.acRoute.snapshot.queryParamMap.get('codeObservation');
    const queryCustomerCode = +this.acRoute.snapshot.queryParamMap.get('customerCode');
    const queryPaymentStatus = +this.acRoute.snapshot.queryParamMap.get('paymentStatus');
    const queryDate = this.acRoute.snapshot.queryParamMap.get('date');
    const queryPage = +this.acRoute.snapshot.queryParamMap.get('page');
    const queryLocked = this.acRoute.snapshot.queryParamMap.get('locked');


    if (queryCodeObs) {

      return {
        codeObservation: queryCodeObs,
        page: queryPage ? queryPage : 1
      };

    } else {

      return {
        paymentStatus: queryPaymentStatus ? queryPaymentStatus : undefined,
        date: queryDate ? DateHelper.usStringToDate(queryDate) as Date : undefined,
        customerCode: queryCustomerCode ? queryCustomerCode : undefined,
        page: queryPage ? queryPage : 1,
        locked: queryLocked ? +queryLocked as 1 | 2 : undefined
      };

    }

  }

  /**
   * Realiza a consulta das vendas
   */
  private loadSales(): void {

    // Antes de carregar as vendas recuperamos o código da venda que deve ser focada após a lista ser carregada
    this.focusCode = this.posService.getFocusTarget();

    this.status.next('carregando');
    this.posService.getSales(this.getFilter(), this.filteringQuotes)
      .pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe(response => {

      this.sales.next(response);
      this.checkResults();

    }, () => {

      // Define como vazio
      this.status.next('vazio');

    });

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults(): void {
    this.setNextPageDisabled(this.sales.getValue().length < 50);
    this.status.next(this.sales.getValue().length > 0 ? 'pronto' : 'vazio');
  }

}
