import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {BootstrapService} from '@base/services/bootstrap.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {Bootstrap} from '@base/models/bootstrap';
import {LayoutService} from '@core/services/layout.service';
import {takeUntil} from 'rxjs/operators';
import {Platform} from '@angular/cdk/platform';
import * as Hammer from 'hammerjs';
import {DcSideMenu, DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {DrawerMenuComponent} from '@base/components/drawer-menu/drawer-menu.component';
import {Router} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {UserOrdersComponent} from './modules/user/components/user-orders/user-orders.component';
import {UserLoginComponent} from './modules/user/components/user-login/user-login.component';

@Component({
  selector: 'clpdv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  /** Dados de bootstrap do catálogo */
  readonly bootsTrap: BehaviorSubject<Bootstrap>;

  /** Se a visualização atual é mobile ou não */
  readonly mobileView: BehaviorSubject<boolean>;

  /** Se a plataforma atual é mobile ou não */
  isMobilePlatform: boolean;

  /** Emite um evento quando o componente é destruído para cancelar quaisquer inscrições de observables */
  private readonly unsub = new Subject<void>();

  /** Referencia do drawer aberto */
  private drawerRef: DcSideMenuRef<DrawerMenuComponent>;

  /** Se o drawer está aberto ou não */
  private drawerOpened: boolean;

  constructor(private bootstrapService: BootstrapService, private layoutService: LayoutService, private elementRef: ElementRef,
              private platForm: Platform, private cdr: ChangeDetectorRef, private sideMenu: DcSideMenu, private router: Router,
              private authService: AuthService) {

    // Recupera se a visualização atual é mobile
    this.mobileView = this.layoutService.onMobileBPChanges();

    // Recupera os dados de bootstrap do catálogo
    this.bootsTrap = this.bootstrapService.catalogSettings;

    this.isMobilePlatform = this.platForm.ANDROID || this.platForm.IOS;

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    // Registra para fechar o sideNav quando ocorrer alteração entre a visualização mobile e desktop
    this.mobileView.asObservable().pipe(takeUntil(this.unsub)).subscribe(mobile => {

      if (!mobile && this.drawerOpened) {
        console.log('Deve fechar o drawer');
        this.drawerRef.close();
      }

    });

    // Registramos para os eventos de pan somente em em dispositivos móveis
    if (this.isMobilePlatform) {
      this.initGesturesObserver();
    }

  }

  ngOnDestroy(): void {

    // Emite o evento para finalizar as inscrições
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Abre o drawer na visualização mobile
   */
  openDrawer(): void {

    if (this.mobileView.getValue() === true) {

      this.drawerRef = this.sideMenu.open(DrawerMenuComponent, {
        position: 'left',
        restoreFocus: false,
        autoFocus: false,
        width: 'unset',
        data: this.bootsTrap.getValue().productCategoryList
      });

      this.drawerOpened = true;
      this.drawerRef.afterClosed().pipe(takeUntil(this.unsub)).subscribe((categoryCode: number) => {

        this.drawerOpened = false;

        // Navegamos para a categoria aqui pois o comportamento do sideMenu de bloquear o scroll, evita
        // que a restauração do scroll no topo da página ocorra quando a navegação ocorre
        if (Number.isFinite(categoryCode)) {
          this.router.navigate(['/products'], {queryParams: {category: categoryCode}}).then();
        }

      });

    }

  }

  /**
   * Abre o painel do usuário.
   */
  openUserPanel(): void {

    if (this.authService.isLoggedIn()) {
      this.sideMenu.open(UserOrdersComponent, {autoFocus: false});
    } else {
      this.sideMenu.open(UserLoginComponent, {
        data: 'Realize login para acessar os seus pedidos.',
        autoFocus: !this.isMobilePlatform
      });
    }

  }

  /**
   * Inicia o observer para os eventos de gestos usando o HammerJS
   * @private
   */
  private initGesturesObserver(): void {

    // Quando a HammerJS emite um evento, verificamos se o menu é exibido e seu estado atual
    // para determinarmos seu próximo estado.
    // Usamos o cdr porquê o menu não muda de estado se não obrigarmos um ciclo de `ChangeDetection`.
    const hammerTime = new Hammer(this.elementRef.nativeElement, {});
    hammerTime.on('panright', (event: any) => {

      if (event.isFinal && !this.drawerOpened) {
        this.openDrawer();
      }

    });

  }

}
