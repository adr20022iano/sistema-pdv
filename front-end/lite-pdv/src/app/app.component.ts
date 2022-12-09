import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {AuthService} from './modules/core/services/auth.service';
import {LayoutService} from './modules/core/services/layout.service';
import {RouteData} from './guards/route-data';
import {ProductsService} from './modules/products/services/products.service';
import {PosService} from './modules/pos/services/pos.service';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {CashBookService} from './modules/cash-book/services/cash-book.service';
import {HeaderService} from './modules/base/services/header.service';

@Component({
  selector: 'lpdv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** O título da página, exibido no cabeçalho e usado para atualizar a propriedade title do header html. */
  pageTitle = new BehaviorSubject<string>('');

  /** Se a página atual exibe o menu de navegação ou não */
  routeHasNavMenu = false;

  /** Se o dispositivo atual é iOS */
  isIOS: boolean;

  constructor(private router: Router, private acRoute: ActivatedRoute, private authService: AuthService,
              private layoutService: LayoutService, private platForm: Platform, private productsService: ProductsService,
              private posService: PosService, private dialog: DcDialog, private cashBookService: CashBookService,
              private headerService: HeaderService) {

    this.isIOS = this.platForm.IOS;

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.setupRouteObserver();
  }

  /**
   * Executando quando um item do drawer é clicado
   */
  drawerClick(): void {

    // Redefinimos os targets de foco dos produtos e vendas ao clicar
    // no menu
    this.posService.getFocusTarget();
    this.productsService.getFocusTarget();

  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Escuta pelas alterações na rota e atualiza a propriedade title da página.
   * @private
   */
  private setupRouteObserver() {

    // Filtramos os eventos do tipo NavigationEnd para ter certeza que não ocorrerão redirecionamentos
    // e acessamos a propriedade title no snapshot da rota
    this.router.events.pipe(filter(event => event instanceof NavigationEnd),
      map(() => {
        const child = this.acRoute.firstChild;
        return child.snapshot.data;
      })
    ).subscribe((data: RouteData) => {

      // Define o título da página e o conteúdo do cabeçalho
      this.headerService.setTitle(data.title);
      this.headerService.setBackButtonRoute(data.backButtonRoute);

      // Verificamos se a rota atual possui o menu ou não,
      // se sim, definimos o modo de exibição do menu se a visualização atual suporta o sideNav
      this.routeHasNavMenu = (data.hasSideNav && this.authService.isLoggedIn());

    });

  }

  /**
   * Abre o link de suporte na página da Devap.
   */
  @HostListener('document:keydown.F1', ['$event']) help(event: KeyboardEvent) {
    event.preventDefault();
    window.open('https://devap.com.br/contato#suporte', '_blank');
  }

}
