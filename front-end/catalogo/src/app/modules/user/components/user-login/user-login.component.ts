import {Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DcSideMenu, DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {LayoutService} from '@core/services/layout.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AuthService} from '@core/services/auth.service';
import {ContactComponent} from '@base/components/contact/contact.component';
import {environment} from '../../../../../environments/environment';
import {catalogParams} from '@core/catalog-params';
import {RecaptchaV3Service} from '@devap-br/devap-components/common';

@Component({
  selector: 'clpdv-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLoginComponent implements OnInit, OnDestroy {

  /** Formulário de login */
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private sideMenuRef: DcSideMenuRef<UserLoginComponent>, @Inject(SIDE_MENU_DATA) public customLabel: string,
              private layoutService: LayoutService, private authService: AuthService, private sideMenu: DcSideMenu,
              private recaptchaService: RecaptchaV3Service) {
  }

  ngOnInit(): void {
    this.initLayoutChanges();
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Realiza o login do usuário
   */
  login(): void {

    if (this.loginForm.invalid) {
      return;
    }

    this.loginForm.disable();

    if (environment.production) {

      // Realiza a validação do recaptcha
      const action = 'login_'.concat(catalogParams.reCaptchaAction);
      this.recaptchaService.execute(action).pipe(takeUntil(this.unsub)).subscribe(token => {

        // Realiza o login informando o token do recaptcha
        this.sendLoginRequest(token);

      });

    } else {

      // Envia a requisição localmente
      this.sendLoginRequest();

    }


  }

  /**
   * Abre a janela de contato.
   */
  openContact(): void {
    this.sideMenuRef.close();
    this.sideMenu.open(ContactComponent, {autoFocus: false});
  }

  /**
   * Envia a requisição de login do recaptcha.
   * @param recaptchaToken O token de acesso do recaptcha.
   * @private
   */
  private sendLoginRequest(recaptchaToken?: string): void {

    const data = this.loginForm.getRawValue();
    this.authService.login(data.email, data.password, recaptchaToken).pipe(takeUntil(this.unsub)).subscribe(() => {
      this.sideMenuRef.close(true);
    }, () => {
      this.loginForm.enable();
    });

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
