import {ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Params, Router, RouterEvent} from '@angular/router';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {DateHelper} from 'src/app/modules/shared/helpers/date-helper';
import {SalesFilter} from '../../models/sales-filter';
import {Sale} from '../../models/sale';
import {PosService} from '../../services/pos.service';
import {SalesFilterComponent} from '../sales-filter/sales-filter.component';
import {SalePaymentsComponent} from './sale-payments/sale-payments.component';
import {HasPaginationDirective} from '../../../shared/directives/has-pagination.directive';
import {SaleForPrint} from '../../models/sale-for-print';
import {MultiplePaymentsComponent} from '../multiple-payments/multiple-payments.component';
import {HeaderService} from '../../../base/services/header.service';
import {ShareHelperService} from '../../../shared/helpers/share-helper';
import {Platform} from '@angular/cdk/platform';
import {HeaderMenuItem} from '../../../shared/components/header-menu/header-menu-item';
import {CouponType, SaleCouponHelper} from '../../helpers/sale-coupon-helper';
import {RECEIPT_TYPE} from '../../../settings/models/receipt-type.enum';
import {SaleReceiptHelper} from '../../helpers/sale-receipt-helper';
import {LogoService} from '../../../shared/services/logo.service';

@Component({
  selector: 'lpdv-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesComponent extends HasPaginationDirective<SalesFilter> implements OnInit, OnDestroy {

  /** Se o usu??rio do sistema pode excluir vendas ou n??o */
  canDeleteSales = false;

  /** Se o usu??rio do sistema ?? administrador ou n??o */
  admin = false;

  /** As vendas exibidas na p??gina */
  sales = new BehaviorSubject<Sale[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Controla o status de desabilitado dos bot??es da pagina????o */
  previousPageDisabled = true;
  nextPageDisabled = true;

  /** C??digo da venda que deve ser focada ap??s carregamento da lista */
  focusCode: number;

  /** Se o m??dulo de cat??logo est?? habilitado */
  catalogModule: boolean;

  /** Se o m??dulo de for??a de vendas est?? habilitado */
  externalSalesModule: boolean;

  /** Se est?? filtrando vendas normais ou or??amentos */
  readonly filteringQuotes: boolean;

  /** Op????es do menu */
  menuOptions: HeaderMenuItem[];

  /** Gerencia as inscri????es */
  private unsub: Subject<any> = new Subject();

  constructor(private posService: PosService, router: Router, private sideMenu: DcSideMenu, private authService: AuthService,
              route: ActivatedRoute, private dialog: DcDialog, private snackBar: DcSnackBar, private headerService: HeaderService,
              private shareHelper: ShareHelperService, private platform: Platform, private logoService: LogoService) {

    super(route, router);
    const userConfig = this.authService.getUserConfig();
    this.canDeleteSales = (this.authService.isAdmin() || userConfig?.sellerDeleteSale);
    this.admin = this.authService.isAdmin();
    this.catalogModule = userConfig?.catalogModule;
    this.externalSalesModule = userConfig?.externalSalesModule;

    // Recuperamos se estamos filtrando pedidos abertos, fechados, ou or??amentos
    const url = this.router.url;
    if (url.startsWith('/quotes')) {
      this.filteringQuotes = true;
    }

    // Define as op????es do menu
    this.setHeadersOptions();

    // Filtramos os eventos de NavigationEnd que n??o ocorrem no outlet de impress??o para poder carregar as vendas
    this.router.events.pipe(
      filter((event: RouterEvent) => (event instanceof NavigationEnd)), takeUntil(this.unsub)).subscribe(() => {

      // Carrega as vendas ou or??amentos
      this.loadSales();

    });

  }

  /**
   * Retorna a label exibida no placeholder
   */
  get placeholderLabel(): string {
    return this.filteringQuotes ? 'Nenhum or??amento encontrado' : 'Nenhuma venda encontrada';
  }

  ngOnInit(): void {

  }

  /**
   * Abre o menu de lan??amentos financeiros da venda.
   * @param saleIndex O index da venda na listagem.
   * @param sale A venda selecionada.
   * @param reloadOnClose Se deve recarregar ao fechar o menu
   */
  salePayments(saleIndex: number, sale: Sale, reloadOnClose = false) {

    const paymentsSideMenu = this.sideMenu.open(SalePaymentsComponent, {data: sale, autoFocus: false});
    paymentsSideMenu.componentInstance.onPaymentsChange().pipe(takeUntil(this.unsub)).subscribe(() => {

      const currentSales = this.sales.getValue();
      const newSale = Object.assign({}, sale);
      currentSales.splice(saleIndex, 1, newSale);
      this.sales.next(currentSales);

    });

    if (reloadOnClose) {
      paymentsSideMenu.afterClosed().pipe(takeUntil(this.unsub)).subscribe(() => {
        this.loadSales();
      });
    }

  }

  /**
   * Exclui a venda informada.
   * @param saleIndex Index da venda na lista.
   * @param sale Venda selecionada para exclus??o.
   */
  delete(saleIndex: number, sale: Sale) {

    const title = this.filteringQuotes ? 'Excluir or??amento?' : 'Excluir venda';
    const config = new ConfirmationDlgConfig(
      title,
      'Esta opera????o n??o poder?? ser revertida.',
      null,
      'Excluir',
      'Cancelar');

    this.dialog.open(ConfirmationDlgComponent, {
      data: config,
      minWidth: '35%'
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        if (this.filteringQuotes) {
          this.deleteQuote(saleIndex, sale);
        } else {
          this.deleteSale(saleIndex, sale);
        }

      }

    });

  }

  /**
   * Realiza o pagamento de m??ltiplos pagamentos
   */
  multiplePayments = (): void => {

    this.sideMenu.open(MultiplePaymentsComponent, {autoFocus: false}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((shouldReload: boolean) => {
        if (shouldReload) {
          this.loadSales();
        }
      });

  };

  /**
   * Abre a p??gina de nova venda
   */
  @HostListener('document:keydown.F2')
  newSale = (): void => {
    this.router.navigate(['/sales/new-sale']).then();
  };

  /**
   * Abre o menu para filtrar as vendas
   */
  filterSales = () => {

    this.sideMenu.open(SalesFilterComponent, {
      data: {
        ...this.getFilter(),
        filterQuotes: this.filteringQuotes,
      },
      autoFocus: false
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe(result => {

      // Se o resultado do menu for true, devemos redefinir a busca, se n??o devemos
      // interpretar o resultado como um FiltroProdutos e realizar a busca
      if (result === true) {
        this.updateUrlFilter();
        return;
      }

      // Mesmo o resultado n??o sendo true, devemos verificar se o resultado foi definido,
      // pois, o sideMenu retorna undefined se ele for fechado pelo dcSideMenuClose ou um
      // clique no background
      const filterResult = result as SalesFilter;

      if (filterResult) {
        this.updateUrlFilter(filterResult);
      }

    });

  };

  /**
   * Realiza a consulta de todas as vendas
   */
  filterAllSales(): void {
    this.updateUrlFilter(this.getFilter());
  }

  /**
   * Altera o status de bloqueio de edi????o externa de uma venda.
   * @param sale A venda que ser?? alterada.
   * @param index O index da venda na listagem
   */
  changeSaleBlock(sale: Sale, index: number): void {

    this.posService.setSaleLock(sale.code, !sale.locked).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe(() => {

      // Atualiza a venda na lista de vendas
      const currentSales = this.sales.getValue();
      const updatedSale = {...sale, locked: !sale.locked};
      currentSales.splice(index, 1, updatedSale);
      this.sales.next(currentSales);

      const snackBarMsg = sale.locked ? 'Venda bloqueada para edi????o externa.' : 'Venda desbloqueada para edi????o externa.';
      this.snackBar.open(snackBarMsg, null, {duration: 3500, panelClass: 'sucesso'});

    });


  }

  /**
   * Realiza a requisi????o dos dados de uma venda para compartilhamento
   * @param sale A venda com todos seus dados para compartilhamento
   */
  getSaleForShare(sale: Sale) {

    // Consulta a venda ou or??amento para impress??o
    this.posService.getSaleForPrint(sale.code, this.filteringQuotes).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub)))
      .subscribe((response => {
        this.shareSale(response);
      }));


  }

  /** Fun????o trackBy da lista de vendas */
  salesTrackBy(index: number, sale: Sale) {
    return sale.code;
  }

  ngOnDestroy(): void {

    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Abre a edi????o de uma venda.
   * @param sale A venda selecionada para edi????o.
   */
  editSale(sale: Sale): void {

    this.router.navigate(['edit', sale.code],
      {queryParamsHandling: 'preserve', relativeTo: this.acRoute}).then();

  }

  /**
   * Realiza a requisi????o dos dados de uma venda para compartilhamento
   * @param sale A venda com todos seus dados para compartilhamento
   * @param share Se deve compartilhar a venda/or??amento
   */
  loadSaleForPDFCreation(sale: Sale, share?: boolean): void {

    this.posService.getSaleForPrint(sale.code, this.filteringQuotes)
      .pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe((response => {

      if (share) {

        this.shareSale(response, this.filteringQuotes);
        return;

      }

      this.createSalePDF(response);

    }));

  }

  /**
   * Cria o pdf Da venda para impress??o
   * @param sale
   */
  createSalePDF(sale: SaleForPrint): void {

    const receiptType = sale.print.receiptType;

    if (receiptType === RECEIPT_TYPE.COUPON_80 || receiptType === RECEIPT_TYPE.COUPON_52) {

      const couponType: CouponType = receiptType === RECEIPT_TYPE.COUPON_80 ? '80' : '52';
      new SaleCouponHelper(sale, this.filteringQuotes, couponType, {
        left: sale.print.couponMarginLeft,
        right: sale.print.couponMarginRight
      }, 1, this.logoService.getLogo()).print();

    } else {

      const halfPage = receiptType === RECEIPT_TYPE.A4_HALF_PAGE;
      new SaleReceiptHelper(sale, this.filteringQuotes, halfPage, 1, this.logoService.getLogo()).print();

    }

  }

  /**
   * Atualiza a url do filtro
   * @param params par??metros para a atualiza????o do filtro, se n??o informado, remove os filtros
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
        origin: params?.origin,
        locked: params?.locked,
        sellerCode: params?.sellerCode ? params.sellerCode : undefined,
        value: params?.value
      };

    }

    // Navegamos para a mesma rota atualizando os par??metros de busca, que faz com que a inscri????o dos eventos do
    // router carregue a lista novamente.
    this.router.navigate([], {
      relativeTo: this.acRoute,
      queryParams: filterParams,
      queryParamsHandling: params?.codeObservation ? undefined : 'merge',
    }).then();

  }

  /**
   * Envia a requisi????o para excluir uma venda.
   * @param saleIndex O ??ndice da venda na lista
   * @param sale A venda selecionada para exclus??o.
   * @private
   */
  private deleteSale(saleIndex: number, sale: Sale): void {

    this.posService.deleteSale(sale.code).pipe(takeUntil(this.unsub)).subscribe(() => {

      const currentSales = this.sales.getValue();
      currentSales.splice(saleIndex, 1);
      this.sales.next(currentSales);
      this.checkResults();
      this.snackBar.open('Venda exclu??da.', null, {panelClass: 'sucesso', duration: 3500});

    });

  }

  /**
   * Envia a requisi????o para excluir um or??amento.
   * @param quoteIndex O ??ndice do or??amento na lista
   * @param quote O or??amento selecionado para exclus??o.
   * @private
   */
  private deleteQuote(quoteIndex: number, quote: Sale): void {

    this.posService.deleteQuote(quote.code).pipe(takeUntil(this.unsub)).subscribe(() => {

      const currentSales = this.sales.getValue();
      currentSales.splice(quoteIndex, 1);
      this.sales.next(currentSales);
      this.checkResults();
      this.snackBar.open('Or??amento exclu??do.', null, {panelClass: 'sucesso', duration: 3500});

    });

  }

  /**
   * Compartilha a venda selecionada.
   * @param sale A venda com todos seus dados para compartilhamento.
   * @param isQuote Se a venda compartilhada ?? um or??amento.
   */
  private shareSale(sale: SaleForPrint, isQuote?: boolean) {

    const receipt = new SaleReceiptHelper(sale, this.filteringQuotes, false, 1, this.logoService.getLogo());

    if (this.platform.IOS || this.platform.ANDROID) {
      const shareTitle = (isQuote ? 'Or??amento ' : 'Venda ').concat(sale.code.toString());
      this.sharePDF(receipt.toFile(shareTitle.concat('.pdf')), shareTitle);
    } else {
      receipt.print();
    }

  }

  /**
   * Compartilha o arquivo PDF informado
   * @param pdfFile O arquivo pdf
   * @param shareTitle O t??tulo para a janela de compartilhamento
   * @private
   */
  private sharePDF(pdfFile: File, shareTitle: string): void {

    if (!this.shareHelper.supportsShare() || !this.shareHelper.canShareFile([pdfFile])) {
      console.error('N??o ?? poss??vel compartilhar arquivos');
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

    // Recuperamos os par??metros de filtro
    const queryCodeObs = this.acRoute.snapshot.queryParamMap.get('codeObservation');
    const queryCustomerCode = +this.acRoute.snapshot.queryParamMap.get('customerCode');
    const queryPaymentStatus = +this.acRoute.snapshot.queryParamMap.get('paymentStatus');
    const queryDate = this.acRoute.snapshot.queryParamMap.get('date');
    const queryPage = +this.acRoute.snapshot.queryParamMap.get('page');
    const queryLocked = this.acRoute.snapshot.queryParamMap.get('locked');
    const queryOrigin = this.acRoute.snapshot.queryParamMap.get('origin');
    const querySellerCode = +this.acRoute.snapshot.queryParamMap.get('sellerCode');
    const queryValue = this.acRoute.snapshot.queryParamMap.get('value');

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
        locked: queryLocked ? +queryLocked as 1 | 2 : undefined,
        // Usamos um operador tern??rio na verifica????o dos valores que podem ser 0, por que se j?? aplic??ssemos
        // o operador +queryParam e seu valor fosse null, por n??o existir, eles retornariam 0 incorretamente
        origin: queryOrigin ? +queryOrigin : undefined,
        sellerCode: querySellerCode ? querySellerCode : undefined,
        value: queryValue ? + queryValue : undefined
      };

    }

  }

  /**
   * Realiza a consulta das vendas
   */
  private loadSales(): void {

    // Antes de carregar as vendas recuperamos o c??digo da venda que deve ser focada ap??s a lista ser carregada
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
   * Define se a consulta tem resultados ou n??o
   */
  private checkResults(): void {
    this.setNextPageDisabled(this.sales.getValue().length < 50);
    this.status.next(this.sales.getValue().length > 0 ? 'pronto' : 'vazio');
  }

  /**
   * Define os itens do header.
   * @private
   */
  private setHeadersOptions(): void {

    const itens: HeaderMenuItem[] = [
      {label: 'Nova venda', icon: 'add', onClick: this.newSale, shortcut: 'F2'},
      {label: 'Filtrar', icon: 'search', onClick: this.filterSales},
    ];

    // Se n??o est?? filtrando or??amentos
    if (!this.filteringQuotes) {

      itens.push({label: 'Or??amentos', icon: 'request_quote', url: '/quotes'});
      itens.push({label: 'Recebimento m??ltiplo', icon: 'payments', onClick: this.multiplePayments});

    }

    this.menuOptions = itens;

  }

}
