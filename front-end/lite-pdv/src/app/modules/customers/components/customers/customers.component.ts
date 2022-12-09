import {ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Params, Router, RouterEvent} from '@angular/router';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {CustomersService} from '../../services/customers.service';
import {NewCustomerComponent, NewCustomerSideMenuData} from '../new-customer/new-customer.component';
import {CustomersFilter} from '../../models/customer-filter';
import {CustomersFilterComponent} from '../customers-filter/customers-filter.component';
import {Customer} from '../../models/customer';
import {HasPaginationDirective} from '../../../shared/directives/has-pagination.directive';
import {HeaderMenuItem} from '../../../shared/components/header-menu/header-menu-item';

@Component({
  selector: 'lpdv-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent extends HasPaginationDirective<CustomersFilter> implements OnInit, OnDestroy {

  /** Clientes exibidos no componente */
  customers = new BehaviorSubject<Customer[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Se está filtrando algo ou não */
  filtering = false;

  /** Opções do menu */
  menuOptions: HeaderMenuItem[];

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  /** Se pode abrir um menu usando atalhos do teclado ou não */
  openedSideMenu: boolean;

  constructor(private clientesService: CustomersService, router: Router, private snackBar: DcSnackBar,
              private sideMenu: DcSideMenu, acRoute: ActivatedRoute) {

    super(acRoute, router);

    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        // Carrega os clientes
        this.loadCustomers();

      });

    this.setHeadersOptions();

  }

  /**
   * Label de filtro para o menu do cabeçalho
   */
  get filterLabel(): string {
    return this.filtering ? 'Exibindo clientes filtrados em ordem alfabética' : 'Exibindo clientes em ordem de faturamento recebido';
  }

  /**
   * Abre a janela para adicionar um novo cliente
   */
  @HostListener('document:keydown.F2')
  newCustomer = () => {

    if (this.openedSideMenu) {
      return;
    }

    this.openedSideMenu = true;

    this.sideMenu.open(NewCustomerComponent, {autoFocus: false}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((shouldReload: boolean) => {

        this.openedSideMenu = false;

        if (shouldReload) {
          this.loadCustomers();
        }

      });

  };

  /**
   * Edita o cliente selecionado
   * @param customerForEdition Cliente selecionado para edição
   */
  editCustomer(customerForEdition: Customer) {

    if (this.openedSideMenu) {
      return;
    }

    this.openedSideMenu = true;

    const data: NewCustomerSideMenuData = {customerForEdition};
    this.sideMenu.open(NewCustomerComponent, {data}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((shouldReload: boolean) => {

        this.openedSideMenu = false;

        if (shouldReload) {
          this.loadCustomers();
        }

      });

  }

  /**
   * Deleta o cliente informado
   * @param customer Cliente selecionado para nova venda
   */
  newSaleForCustomer(customer: Customer) {

    this.clientesService.setCustomerForSale(customer);
    this.router.navigateByUrl('sales/new-sale').then();

  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Abre a janela para filtrar os contatos
   */
  openFilter = () => {

    if (this.openedSideMenu) {
      return;
    }

    this.openedSideMenu = true;

    this.sideMenu.open(CustomersFilterComponent, {data: this.getFilter(), autoFocus: false}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe(result => {

      this.openedSideMenu = false;

      // Se o resultado do menu for true, devemos redefinir a busca, se não devemos
      // interpretar o resulto como um FiltroProdutos e realizar a busca
      if (result === true) {
        this.updateUrlFilter(undefined);
        return;
      }

      // Mesmo o resultado não sendo true, devemos verificar se o resultado foi definido,
      // pois, o sideMenu retorna undefined se ele for fechado pelo dcSideMenuClose ou um
      // clique no background
      const filterResult = result as CustomersFilter;

      if (filterResult) {

        this.updateUrlFilter(filterResult);

      }

    });

  };

  /**
   * Função trackBy para listagem
   */
  customersTrackBy(index: number, item: Customer) {
    return item.code;
  }

  ngOnInit(): void {
  }

  /**
   * Atualiza a url do filtro
   * @param params parâmetros para a atualização do filtro, se não informado, remove os filtros
   * @protected
   */
  protected updateUrlFilter(params: CustomersFilter | undefined): void {

    let filterParams: Params;
    filterParams = {
      page: 1,
      name: params?.name || undefined,
      city: params?.city || undefined,
      // Nas opções abaixo usamos um operador ternário, pois elas podem retornar 0, que não causa o retorno no operador
      // coalescente e elas não devem ser exibidas como 0 na url atualizada
      sale: params?.sale ? params.sale : undefined,
      catalog: params?.catalog ? params.catalog : undefined,
      email: params?.email || undefined,
      doc: params?.document || undefined
    };

    // Navegamos para a mesma rota atualizando os parâmetros de busca, que faz com que a inscrição dos eventos do
    // router carregue a lista novamente.
    this.router.navigate([], {
      relativeTo: this.acRoute,
      queryParams: filterParams,
      queryParamsHandling: 'merge',
    }).then();

  }

  /**
   * Carrega a lista de clientes
   */
  private loadCustomers() {

    const customersFilter = this.getFilter();
    this.filtering = !(!customersFilter.city && !customersFilter.name &&
      !customersFilter.catalog && !customersFilter.sale && !customersFilter.document && !customersFilter.email);

    this.status.next('carregando');
    this.clientesService.getCustomers(this.getFilter()).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe(response => {

      this.customers.next(response);
      this.checkResults();

    }, () => {

      this.status.next('vazio');

    });

  }

  /**
   * Retorna o novo status para o loader
   */
  private checkResults(): void {
    this.setNextPageDisabled(this.customers.getValue().length < 50);
    this.status.next(this.customers.getValue().length > 0 ? 'pronto' : 'vazio');
  }

  /**
   * Retorna o filtro dos clientes
   * @private
   */
  private getFilter(): CustomersFilter {

    const queryName = this.acRoute.snapshot.queryParamMap.get('name');
    const queryCity = this.acRoute.snapshot.queryParamMap.get('city');
    const queryDocument = this.acRoute.snapshot.queryParamMap.get('doc');
    const queryEmail = this.acRoute.snapshot.queryParamMap.get('email');
    const queryPage = +this.acRoute.snapshot.queryParamMap.get('page');
    const querySale = +this.acRoute.snapshot.queryParamMap.get('sale');
    const queryCatalog = +this.acRoute.snapshot.queryParamMap.get('catalog');

    return {
      name: queryName,
      city: queryCity,
      page: queryPage ? queryPage : 1,
      sale: querySale,
      catalog: queryCatalog,
      document: queryDocument,
      email: queryEmail
    };

  }

  /**
   * Define os itens do header.
   * @private
   */
  private setHeadersOptions(): void {

    this.menuOptions = [
      {label: 'Novo cliente', icon: 'add', shortcut: 'F2', onClick: this.newCustomer},
      {label: 'Filtrar', icon: 'search', onClick: this.openFilter}
    ];

  }

}
