import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, forkJoin, merge, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {StockHandling} from '../../models/stock-handling';
import {NewProduct} from '../../models/new-product';
import {PRODUCT_HANDLING_TYPE} from '../../models/product-handling-type.enum';
import {ProductsService} from '../../services/products.service';

@Component({
  selector: 'lpdv-stock-handlings',
  templateUrl: './stock-handlings.component.html',
  styleUrls: ['./stock-handlings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockHandlingsComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Nova consulta unsub */
  newRequestUnsub: Subject<any> = new Subject();

  /** O código do produto que está sendo listado */
  productCode: number;

  /** Produto que está sendo consultado */
  product: NewProduct;

  /** As movimentações do produto */
  stockHandlings = new BehaviorSubject<StockHandling[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Se o usuário do sistema é um administrador */
  isAdmin: boolean;

  /** A página atual */
  page = 1;

  /** Controla o status de desabilitado dos botões da paginação */
  previousPageDisabled = true;
  nextPageDisabled = true;

  constructor(private router: Router, private route: ActivatedRoute, private productsService: ProductsService,
              private dialog: DcDialog, private snackBar: DcSnackBar, authService: AuthService) {

    this.isAdmin = authService.isAdmin();
    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        this.productCode = +this.route.snapshot.paramMap.get('productCode');
        this.productsService.setFocusTarget(this.productCode);
        const page = +this.route.snapshot.queryParamMap.get('page');
        this.page = page ? page : 1;
        this.loadHandlings();

      });

  }

  ngOnInit(): void {
  }

  /**
   * Consulta os dados de movimentação e do produto
   */
  loadHandlings() {

    this.status.next('carregando');
    forkJoin([this.productsService.getStockHandlings(this.productCode, this.page), this.productsService.getProductInfo(this.productCode)])
      .pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe(response => {

      this.product = response[1];
      this.stockHandlings.next(response[0]);
      this.checkResults();

    }, () => {

      // Define como vazio
      this.status.next('vazio');

    });

  }

  /**
   * Excluir a movimentação informada.
   * @param handlingIndex Index da movimentação na listagem.
   * @param handling Movimentação selecionada.
   */
  deleteHandling(handlingIndex: number, handling: StockHandling) {

    // Dados para confirmação
    const config = new ConfirmationDlgConfig(
      'Excluir movimentação?',
      handling.history,
      'Esta operação não poderá ser revertida.',
      'Excluir');

    // Abre a janela de confirmação
    this.dialog.open(ConfirmationDlgComponent, {
      data: config,
      minWidth: '35%'
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        this.productsService.deleteStockHandling(handling.code).pipe(takeUntil(this.unsub)).subscribe(() => {

          const currentHandlings = this.stockHandlings.getValue();
          currentHandlings.splice(handlingIndex, 1);
          if (handling.type === PRODUCT_HANDLING_TYPE.ENTRY) {
            this.product.stock = this.product.stock - Math.abs(handling.quantity);
          } else {
            this.product.stock = this.product.stock + Math.abs(handling.quantity);
          }
          this.stockHandlings.next(currentHandlings);
          this.snackBar.open('Movimentação excluída com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
        });

      }

    });

  }

  /**
   * Função trackBy para a lista de movimentações
   */
  handlingsTrackBy(index: number, item: StockHandling) {
    return item.code;
  }

  /**
   * Altera entre as páginas
   * @param incrementPage Se deve ir para a próxima página ou para a página anterior
   */
  pageChange(incrementPage: boolean) {

    this.page = incrementPage ? this.page + 1 : this.page - 1;

    // Emite para cancelar qualquer consulta atual
    this.newRequestUnsub.next();

    // Atualiza a url
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page,
      },
      queryParamsHandling: 'merge',
    }).then();

  }

  ngOnDestroy(): void {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();
    this.newRequestUnsub.complete();

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults() {
    this.previousPageDisabled = this.page === 1;
    this.nextPageDisabled = this.stockHandlings.getValue().length < 100;
    this.status.next(this.stockHandlings.getValue().length > 0 ? 'pronto' : 'vazio');
  }

}
