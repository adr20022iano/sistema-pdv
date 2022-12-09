import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
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

@Component({
  selector: 'lpdv-fv-customers',
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

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private clientesService: CustomersService, router: Router, private snackBar: DcSnackBar,
              private sideMenu: DcSideMenu, acRoute: ActivatedRoute) {

    super(acRoute, router);

    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        // Carrega os clientes
        this.loadCustomers();

      });

  }

  /**
   * Abre a janela para adicionar um novo cliente
   */
  newCustomer() {

    this.sideMenu.open(NewCustomerComponent).afterClosed().pipe(takeUntil(this.unsub)).subscribe((shouldReload: boolean) => {

      if (shouldReload) {
        this.loadCustomers();
      }

    });

  }

  /**
   * Edita o cliente selecionado
   * @param customerForEdition Cliente selecionado para edição
   */
  editCustomer(customerForEdition: Customer) {

    const data: NewCustomerSideMenuData = {customerForEdition};
    this.sideMenu.open(NewCustomerComponent, {data}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((shouldReload: boolean) => {

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
  openFilter() {

    this.sideMenu.open(CustomersFilterComponent, {data: this.getFilter()}).afterClosed().pipe(takeUntil(this.unsub)).subscribe(result => {

      // Se o resultado do menu for `true`, devemos redefinir a busca, se não devemos
      // interpretar o result como um `FiltroProdutos` e realizar a busca
      if (result === true) {
        this.updateUrlFilter(undefined);
        return;
      }

      // Mesmo o resultado não sendo true, devemos verificar se o resultado foi definido
      // pois o sideMenu retorna undefined se ele for fechado pelo `dcSideMenuClose` ou um
      // clique no background
      const filterResult = result as CustomersFilter;

      if (filterResult) {

        this.updateUrlFilter(filterResult);

      }

    });

  }

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
      city: params?.city  || undefined,
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
    this.filtering = !(!customersFilter.city && !customersFilter.name && !customersFilter.document);

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
    const queryPage = +this.acRoute.snapshot.queryParamMap.get('page');
    const queryDocument = this.acRoute.snapshot.queryParamMap.get('doc');

    return {
      name: queryName,
      city: queryCity,
      document: queryDocument,
      page: queryPage ? queryPage : 1
    };

  }

}
