import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {AuthService} from './modules/core/services/auth.service';
import {LayoutService} from './modules/core/services/layout.service';
import {RouteData} from './guards/route-data';

@Component({
  selector: 'lpdv-fv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** O título da página, exibido no cabeçalho e usado para atualizar a propriedade `title` do `header` html. */
  pageTitle = new BehaviorSubject<string>('');

  /** Se a página atual exibe o menu de navegação ou não */
  showBottomNav = false;

  /** Se o dispositivo atual é iOS */
  isIOS: boolean;

  constructor(private router: Router, private acRoute: ActivatedRoute, private titleService: Title, private authService: AuthService,
              private layoutService: LayoutService, private cdr: ChangeDetectorRef, private elementRef: ElementRef,
              private platForm: Platform) {

    this.isIOS = this.platForm.IOS;

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.setupRouteObserver();
  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Escuta pelas alterações na rota e atualiza a propriedade `title` da página.
   * @private
   */
  private setupRouteObserver() {

    // Filtramos os eventos do tipo `NavigationEnd` para ter certeza que não ocorrerão redirecionamentos
    // e acessamos a propriedade `title` no `snapshot` da rota
    this.router.events.pipe(filter(event => event instanceof NavigationEnd),
      map(() => {
        const child = this.acRoute.firstChild;
        return child.snapshot.data;
      })
    ).subscribe((data: RouteData) => {

      this.setPageTitle(data.title);

      // Verificamos se a rota atual possui o menu ou não,
      // se sim definimos o modo de exibição do menu se a visualização atual suporta o sideNav
      this.showBottomNav = (data.showBottomNav && this.authService.isLoggedIn());

    });

  }

  /**
   * Define o título da página.
   * @param title O título recuperado da rota atual.
   * @private
   */
  private setPageTitle(title: string) {

    if (title) {

      // Define o título da página e o do cabeçalho
      this.titleService.setTitle(title.concat(' - Lite PDV FV'));
      this.pageTitle.next(title);

    } else {

      // Define o título padrão
      const defaultTitle = 'Lite PDV FV';
      this.pageTitle.next(defaultTitle);
      this.titleService.setTitle(defaultTitle);

    }

  }

  /**
   * Abre o link de suporte na página da Devap.
   */
  @HostListener('document:keydown.F1', ['$event']) help(event: KeyboardEvent) {
    event.preventDefault();
    window.open('https://devap.com.br/contato#suporte', '_blank');
  }

}
