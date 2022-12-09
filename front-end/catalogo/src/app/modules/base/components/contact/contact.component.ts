import {Component, OnInit, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {BootstrapService} from '@base/services/bootstrap.service';
import {LayoutService} from '@core/services/layout.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Bootstrap} from '@base/models/bootstrap';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {RecaptchaV3Service} from '@devap-br/devap-components/common';
import {environment} from '../../../../../environments/environment';
import {Contact} from '@base/models/contact';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {catalogParams} from '@core/catalog-params';

@Component({
  selector: 'clpdv-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit, OnDestroy {

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  /** Dados da empresa */
  bootstrap: Bootstrap;

  /** Dados de endereço da empresa */
  addressInfo: string;

  /** FormGroup para o formulário de contato */
  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required])
  });

  constructor(private sideMenuRef: DcSideMenuRef<ContactComponent>, private bootstrapService: BootstrapService,
              private layoutService: LayoutService, private recaptchaService: RecaptchaV3Service, private snackBar: DcSnackBar) {

    bootstrapService.catalogSettings.asObservable().pipe(takeUntil(this.unsub)).subscribe(value => {
      this.bootstrap = value;

      if (value.config) {

        const config = value.config;
        this.addressInfo = config.address?.concat(
          ' ',
          config.number?.concat(', ') ?? '',
          config.complement?.concat(', ') ?? '',
          config.district ?? '',
          config.city ? ', '.concat(config.city) : ''
        );

      }

    });

  }

  ngOnInit(): void {

    this.initLayoutChanges();

  }

  /**
   * Envia a requisição do formulário de contato
   */
  submitForm(): void {

    // Verifica se o formulário está válido
    if (this.contactForm.valid) {

      // Desabilita o formulário
      this.contactForm.disable();

      if (environment.production) {

        // Realiza a validação do recaptcha
        const action = 'contato_'.concat(catalogParams.reCaptchaAction);
        this.recaptchaService.execute(action).pipe(takeUntil(this.unsub)).subscribe(token => {

          // Realiza o login informando o token do recaptcha
          this.sendContactRequest(token);

        });

      } else {

        // Envia a requisição localmente
        this.sendContactRequest();

      }

    }

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Envia a requisição de contato.
   * @param recaptchaToken O token do recaptcha, se em produção
   * @private
   */
  private sendContactRequest(recaptchaToken?: string): void {

    const contact = this.contactForm.getRawValue() as Contact;
    contact.recaptcha = recaptchaToken;
    this.bootstrapService.sendContact(contact).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.contactForm.enable();
      this.contactForm.reset();
      this.snackBar.open('Sua mensagem foi enviada!', null, {duration: 2500, panelClass: 'snackbar-success'});

    }, () => {

      this.contactForm.enable();
      this.snackBar.open('Erro ao enviar sua mensagem, tente novamente.', null, {duration: 2500, panelClass: 'snackbar-error'});

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
