import {Component, OnInit, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {ShoppingCartService} from '../../../cart/services/shopping-cart.service';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {AuthService} from '@core/services/auth.service';
import {LayoutService} from '@core/services/layout.service';
import {takeUntil} from 'rxjs/operators';
import {LoaderStatus} from '@shared/models/loader-status';
import {CustomerOrder} from '../../../cart/models/customer-order';
import {Router} from '@angular/router';

@Component({
  selector: 'clpdv-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserOrdersComponent implements OnInit, OnDestroy {

  /** Mensagem de boas vindas para o usuário */
  greeting: string;

  /** Lista dos pedidos exibidos */
  orders = new BehaviorSubject<CustomerOrder[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('loading');

  /** Controla o status de desabilitado dos botões da paginação */
  previousPageDisabled = true;
  nextPageDisabled = true;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  /** A página atual da consulta dos pedidos */
  private page = 1;

  /** Emite um evento para cancelar as novas consultas quando a paginação é alterada */
  private newRequestUnsub = new Subject<any>();

  constructor(private sideMenuRef: DcSideMenuRef<UserOrdersComponent>, private shoppingCart: ShoppingCartService,
              private authService: AuthService, private layoutService: LayoutService, private router: Router) {

    this.greeting = UserOrdersComponent.getGreetingMessage().concat(', ', authService.getUserName());

  }

  /**
   * Gera a mensagem de boas vindas para o usuário baseado na hora atual
   * @private
   */
  private static getGreetingMessage(): string {

    const currentHours = new Date().getHours();

    if (currentHours > 6 && currentHours < 12) {
      return 'Bom dia';
    } else if (currentHours > 12 && currentHours < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadOrders();
    });

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /** Função trackBy da lista de vendas */
  ordersTrackBy(index: number, order: CustomerOrder): number {
    return order.code;
  }

  /**
   * Carrega a próxima página de vendas.
   * @param incrementPage se deve incrementar ou reduzir a página atual.
   */
  pageChange(incrementPage: boolean): void {
    this.newRequestUnsub.next();
    this.page = incrementPage ? this.page + 1 : this.page - 1 || 1;
    this.loadOrders();
  }

  /**
   * Navega para os detalhes do pedido que foi clicado.
   * @param order O pedido que foi selecionado.
   */
  orderClick(order: CustomerOrder): void {
    this.router.navigate(['order', order.code]).then();
    this.sideMenuRef.close();
  }

  logout(): void {
    this.authService.logout();
    this.sideMenuRef.close();
  }

  /**
   * Realiza a consulta dos pedidos do cliente
   * @private
   */
  private loadOrders(): void {

    this.status.next('loading');
    this.shoppingCart.getCustomerOrders(this.page).pipe(takeUntil(merge(this.unsub, this.newRequestUnsub))).subscribe(response => {

      this.orders.next(response);
      this.checkResults();

    }, () => {

      // Define como vazio
      this.status.next('empty');
      this.orders.next([]);
      this.checkResults();

    });

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults(): void {
    this.nextPageDisabled = this.orders.getValue().length < 50;
    this.previousPageDisabled = this.page < 2;
    this.status.next(this.orders.getValue().length > 0 ? 'done' : 'empty');
  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges(): void {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

}
