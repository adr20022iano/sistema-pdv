import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DcOverlayComponent} from '@devap-br/devap-components/overlay/public-api';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {HeaderService} from '../../services/header.service';


@Component({
  selector: 'lpdv-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {

  /**
   * Título da página, exibido na visualização desktop
   */
  pageTitle: BehaviorSubject<string>;

  /** A rota de destino do botão voltar */
  backButtonRoute: BehaviorSubject<string>;

  /** View do overlay */
  @ViewChild('userMenu') userMenu: DcOverlayComponent;

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Se o usuário logado é o administrador do sistema */
  isAdmin: BehaviorSubject<boolean>;

  constructor(private authService: AuthService, private headerService: HeaderService) {
    this.pageTitle = headerService.getTitle();
    this.backButtonRoute = headerService.backButtonRoute();
  }

  /**
   * Retorna se deve exibir o botão de retorno no header
   */
  get showBackButton(): boolean {
    const backButtonRoute = this.backButtonRoute.getValue();
    return backButtonRoute !== null && backButtonRoute !== undefined && backButtonRoute.length > 0;
  }

  ngOnInit() {

    this.isAdmin = new BehaviorSubject<boolean>(this.authService.isAdmin());
    this.authService.onConfigChange().pipe(takeUntil(this.unsub)).subscribe(userConfig => {
      this.isAdmin.next(userConfig ? userConfig.admin : false);
    });

  }

  /**
   * Realiza o logout do usuário e o redireciona para a página de login
   */
  logout() {
    this.authService.logout();
  }

  /**
   * Abre a página de suporte
   */
  openSupport(): void {
    window.open('https://devap.com.br/contato#suporte', '_blank');
  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

}
