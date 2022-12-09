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

  /** Se o usuário do sistema pode excluir vendas ou não */
  canDeleteSales = false;

  /** Se o usuário do sistema é administrador ou não */
  admin = false;

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
  readonly filteringQuotes: boolean;

  /** Opções do menu */
  menuOptions: HeaderMenuItem[];

  /** Gerencia as inscrições */
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

    // Recuperamos se estamos filtrando pedidos abertos, fechados, ou orçamentos
    const url = this.router.url;
    if (url.startsWith('/quotes')) {
      this.filteringQuotes = true;
    }

    // Define as opções do menu
    this.setHeadersOptions();

    // Filtramos os eventos de NavigationEnd que não ocorrem no outlet de impressão para poder carregar as vendas
    this.router.events.pipe(
      filter((event: RouterEvent) => (event instanceof NavigationEnd)), takeUntil(this.unsub)).subscribe(() => {

      // Carrega as vendas ou orçamentos
      this.loadSales();

    });

  }

  /**
   * Retorna a label exibida no placeholder
   */
  get placeholderLabel(): string {
    return this.filteringQuotes ? 'Nenhum orçamento encontrado' : 'Nenhuma venda encontrada';
  }

  ngOnInit(): void {

  }

  /**
   * Abre o menu de lançamentos financeiros da venda.
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
   * @param sale Venda selecionada para exclusão.
   */
  delete(saleIndex: number, sale: Sale) {

    const title = this.filteringQuotes ? 'Excluir orçamento?' : 'Excluir venda';
    const config = new ConfirmationDlgConfig(
      title,
      'Esta operação não poderá ser revertida.',
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
   * Realiza o pagamento de múltiplos pagamentos
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
   * Abre a página de nova venda
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

      // Se o resultado do menu for true, devemos redefinir a busca, se não devemos
      // interpretar o resultado como um FiltroProdutos e realizar a busca
      if (result === true) {
        this.updateUrlFilter();
        return;
      }

      // Mesmo o resultado não sendo true, devemos verificar se o resultado foi definido,
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
   * Altera o status de bloqueio de edição externa de uma venda.
   * @param sale A venda que será alterada.
   * @param index O index da venda na listagem
   */
  changeSaleBlock(sale: Sale, index: number): void {

    this.posService.setSaleLock(sale.code, !sale.locked).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe(() => {

      // Atualiza a venda na lista de vendas
      const currentSales = this.sales.getValue();
      const updatedSale = {...sale, locked: !sale.locked};
      currentSales.splice(index, 1, updatedSale);
      this.sales.next(currentSales);

      const snackBarMsg = sale.locked ? 'Venda bloqueada para edição externa.' : 'Venda desbloqueada para edição externa.';
      this.snackBar.open(snackBarMsg, null, {duration: 3500, panelClass: 'sucesso'});

    });


  }

  /**
   * Realiza a requisição dos dados de uma venda para compartilhamento
   * @param sale A venda com todos seus dados para compartilhamento
   */
  getSaleForShare(sale: Sale) {

    // Consulta a venda ou orçamento para impressão
    this.posService.getSaleForPrint(sale.code, this.filteringQuotes).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub)))
      .subscribe((response => {
        this.shareSale(response);
      }));


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
   * Abre a edição de uma venda.
   * @param sale A venda selecionada para edição.
   */
  editSale(sale: Sale): void {

    this.router.navigate(['edit', sale.code],
      {queryParamsHandling: 'preserve', relativeTo: this.acRoute}).then();

  }

  /**
   * Realiza a requisição dos dados de uma venda para compartilhamento
   * @param sale A venda com todos seus dados para compartilhamento
   * @param share Se deve compartilhar a venda/orçamento
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
   * Cria o pdf Da venda para impressão
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
        origin: params?.origin,
        locked: params?.locked,
        sellerCode: params?.sellerCode ? params.sellerCode : undefined,
        value: params?.value
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
   * Envia a requisição para excluir uma venda.
   * @param saleIndex O índice da venda na lista
   * @param sale A venda selecionada para exclusão.
   * @private
   */
  private deleteSale(saleIndex: number, sale: Sale): void {

    this.posService.deleteSale(sale.code).pipe(takeUntil(this.unsub)).subscribe(() => {

      const currentSales = this.sales.getValue();
      currentSales.splice(saleIndex, 1);
      this.sales.next(currentSales);
      this.checkResults();
      this.snackBar.open('Venda excluída.', null, {panelClass: 'sucesso', duration: 3500});

    });

  }

  /**
   * Envia a requisição para excluir um orçamento.
   * @param quoteIndex O índice do orçamento na lista
   * @param quote O orçamento selecionado para exclusão.
   * @private
   */
  private deleteQuote(quoteIndex: number, quote: Sale): void {

    this.posService.deleteQuote(quote.code).pipe(takeUntil(this.unsub)).subscribe(() => {

      const currentSales = this.sales.getValue();
      currentSales.splice(quoteIndex, 1);
      this.sales.next(currentSales);
      this.checkResults();
      this.snackBar.open('Orçamento excluído.', null, {panelClass: 'sucesso', duration: 3500});

    });

  }

  /**
   * Compartilha a venda selecionada.
   * @param sale A venda com todos seus dados para compartilhamento.
   * @param isQuote Se a venda compartilhada é um orçamento.
   */
  private shareSale(sale: SaleForPrint, isQuote?: boolean) {

    const receipt = new SaleReceiptHelper(sale, this.filteringQuotes, false, 1, this.logoService.getLogo());

    if (this.platform.IOS || this.platform.ANDROID) {
      const shareTitle = (isQuote ? 'Orçamento ' : 'Venda ').concat(sale.code.toString());
      this.sharePDF(receipt.toFile(shareTitle.concat('.pdf')), shareTitle);
    } else {
      receipt.print();
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
        // Usamos um operador ternário na verificação dos valores que podem ser 0, por que se já aplicássemos
        // o operador +queryParam e seu valor fosse null, por não existir, eles retornariam 0 incorretamente
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

  /**
   * Define os itens do header.
   * @private
   */
  private setHeadersOptions(): void {

    const itens: HeaderMenuItem[] = [
      {label: 'Nova venda', icon: 'add', onClick: this.newSale, shortcut: 'F2'},
      {label: 'Filtrar', icon: 'search', onClick: this.filterSales},
    ];

    // Se não está filtrando orçamentos
    if (!this.filteringQuotes) {

      itens.push({label: 'Orçamentos', icon: 'request_quote', url: '/quotes'});
      itens.push({label: 'Recebimento múltiplo', icon: 'payments', onClick: this.multiplePayments});

    }

    this.menuOptions = itens;

  }

}
