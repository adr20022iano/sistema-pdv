import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {ShoppingCartService} from '../../../cart/services/shopping-cart.service';
import {LoaderStatus} from '@shared/models/loader-status';
import {OrderDetails} from '../models/order-details';
import {CartProduct} from '../../../cart/models/cart-product';
import {AuthService} from '@core/services/auth.service';

@Component({
  selector: 'clpdv-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailsComponent implements OnInit, OnDestroy {

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('loading');

  /** O pedido carregado atualmente */
  order: OrderDetails;

  /** O valor dos produtos do pedido */
  productsTotal: number;

  /** O valor total do pedido */
  orderValue: number;

  /** Label exibido no status do recebimento/pagamento */
  statusLabel: string;

  /** Classe css usada na label de status do recebimento/pagamento  */
  statusClass: string;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private route: ActivatedRoute, private shoppingCart: ShoppingCartService, private router: Router,
              private authService: AuthService) {

    // Filtramos os eventos de NavigationEnd que não ocorrem no outlet de impressão para poder carregar as vendas
    this.router.events.pipe(
      filter((event: RouterEvent) => (event instanceof NavigationEnd)),
      takeUntil(this.unsub)).subscribe(() => {
      this.loadSale();
    });

    // Se o usuário realizar o logout enquanto uma venda estiver sendo visualizada, retorna para a página inicial
    this.authService.onLoginChange().pipe(takeUntil(this.unsub)).subscribe((loggedIn) => {

      if (!loggedIn) {
        // Navega para a página inicial
        this.router.navigate(['/']).then();
      }

    });

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Função trackBy para a lista dos produtos
   */
  productsTrackBy(index: number, item: CartProduct): number {
    return item.code;
  }

  /**
   * Carrega os detalhes da venda.
   * @private
   */
  private loadSale(): void {

    // Recupera o código da venda, se ele existir
    const orderCode = +this.route.snapshot.paramMap.get('orderCode');
    this.status.next('loading');
    this.shoppingCart.getOrderDetails(orderCode).pipe(takeUntil(this.unsub))
      .subscribe((response) => {

        this.order = response;
        this.productsTotal = this.order.products.map(product => product.quantity * product.value).reduce((previous, current) => {
          return previous + current;
        }, 0);
        this.orderValue = this.productsTotal + this.order.shipping - this.order.discount;
        this.setPaymentStatus();
        this.status.next('done');

      }, () => {

        // Navega para a página inicial
        this.router.navigate(['/']).then();

      });

  }

  private setPaymentStatus(): void {

    const paidValue = this.order.paidValue;
    const saleValue = this.orderValue;

    // noinspection DuplicatedCode
    if (paidValue === 0) {

      // Não recebido/pago
      this.statusClass = 'pending-payment';
      this.statusLabel = 'A pagar';

    } else if (paidValue < saleValue) {

      // Recebido/pago parcialmente
      this.statusClass = 'parcial-payment';
      this.statusLabel = 'Pag. parcial';

    } else if (paidValue === saleValue) {

      // Recebido/pago totalmente
      this.statusClass = 'complete-payment';
      this.statusLabel = 'Pago';

    } else if (paidValue > saleValue) {

      // Recebido/pago acima do valor
      this.statusClass = 'superior-payment';
      this.statusLabel = 'Pag. superior';

    }
  }

}
