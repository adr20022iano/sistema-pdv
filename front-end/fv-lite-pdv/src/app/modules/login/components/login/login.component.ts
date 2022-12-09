import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {RecaptchaV3Service} from '@devap-br/devap-components/common';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {environment} from 'src/environments/environment';
import {LoginService} from '../../services/login.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DcInput} from '@devap-br/devap-components/input';
import {PwaService} from '../../../core/services/pwa.service';
import {Platform} from '@angular/cdk/platform';
import {version} from 'package.json';

@Component({
  selector: 'lpdv-fv-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  loginForm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    externalSalesCode: new FormControl('', [Validators.required]),
  });

  @ViewChild('userInput') userInput: ElementRef<DcInput>;
  @ViewChild('userAccessCode') userAccessCode: ElementRef<DcInput>;

  /** Se deve exibir o botão de instalação */
  showInstallButton: BehaviorSubject<boolean>;

  /** Se deve exibir a mensagem de instalação no iOS */
  showIosInstallTip = false;

  /** Versão do app */
  readonly appVersion = version;

  constructor(private loginService: LoginService, private authService: AuthService, private recaptchaService: RecaptchaV3Service,
              private router: Router, private acRoute: ActivatedRoute, private pwaService: PwaService, private platform: Platform) {

    this.showInstallButton = pwaService.showInstallButton;

  }

  ngOnInit(): void {

    // Se o usuário estiver logado, o redireciona para a página de vendas
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/sales').then();
    }

  }

  ngAfterViewInit() {

    // Se o usuário não estiver logado, verificamos qual campo devemos focar na página de login
    if (!this.authService.isLoggedIn()) {

      // Verifica se o usuário foi definido na url
      if (this.acRoute.snapshot.queryParamMap.has('user')) {

        const queryParamUserName = this.acRoute.snapshot.queryParamMap.get('user');
        this.loginForm.get('userName').setValue(queryParamUserName);
        this.userAccessCode.nativeElement.focus();

      } else {

        const litePDVUserName = this.authService.getLitePDVUserName();
        if (litePDVUserName) {

          this.loginForm.get('userName').setValue(litePDVUserName);
          this.userAccessCode.nativeElement.focus();

        } else {
          this.userInput.nativeElement.focus();
        }

      }

    }

  }

  /**
   * Realiza a verificação do recaptcha e o login do usuário
   */
  login() {

    // Verifica se o formulário está válido
    if (this.loginForm.valid) {

      // Desabilita o formulário
      this.loginForm.disable();

      if (environment.production) {

        // Realiza a validação do recaptcha
        this.recaptchaService.execute('loginFVLitePDV').pipe(takeUntil(this.unsub)).subscribe(token => {

          // Realiza o login informando o token do recaptcha
          this.sendLoginRequest(token);

        });

      } else {

        // Realiza o login localmente
        this.sendLoginRequest();

      }

    }

  }

  /**
   * Executa o evento de instalação
   */
  installPWA(): void {

    if (this.platform.IOS) {
      this.showIosInstallTip = true;
    } else {
      this.pwaService.triggerInstallEvent();
    }

  }

  ngOnDestroy(): void {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Efetua o login do usuário
   * @param recaptchaToken O token de acesso do recaptcha, usado apenas em produção.
   */
  private sendLoginRequest(recaptchaToken?: string) {

    // Adicionamos o token do recaptcha antes de realizarmos a requisição de login
    const formData = {...this.loginForm.getRawValue(), recaptcha: recaptchaToken};
    this.loginService.login(formData).pipe(takeUntil(this.unsub)).subscribe(response => {
      this.authService.login(response, formData.userName);
    }, () => {
      this.loginForm.enable();
    });

  }

}
