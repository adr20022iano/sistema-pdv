import {Component, OnInit, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {SettingsService} from '../../services/settings.service';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {CepService} from '../../../shared/services/cep.service';
import {CompanyDetails} from '../../models/company-details';
import {AuthService} from '../../../core/services/auth.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';

@Component({
  selector: 'lpdv-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** A url da imagem retornada pelo webservice e que será exibida como logo da empresa. */
  logoSrc: string;

  /** Formulário de dados da empresa */
  companyDataForm = new FormGroup({
    name: new FormControl(''),
    fantasyName: new FormControl(''),
    document: new FormControl(''),
    phone: new FormControl(''),
    address: new FormControl(''),
    number: new FormControl(''),
    complement: new FormControl(''),
    district: new FormControl(''),
    cep: new FormControl(''),
    email: new FormControl(''),
    city: new FormControl('')
  });

  /** String em base64 da imagem da logo selecionada para envio. */
  private croppedLogo: string;

  /** Se deve deletar a imagem da logo atual */
  private deleteLogo: boolean;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  /** Controla a inscrição do input de cep */
  private readonly cepUnsub = new Subject<void>();

  constructor(private settingsService: SettingsService, private cepService: CepService, private authService: AuthService,
              private snackBar: DcSnackBar) {

  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();
    this.unregisterCepListener();
    this.cepUnsub.complete();

  }

  /**
   * Marca a logo para remoção;
   */
  removeLogo(): void {
    this.deleteLogo = true;
  }

  /**
   * Define a logo em base64.
   * @param imageBase64 A imagem em base64 retornada após o corte.
   */
  setLogo(imageBase64: string) {
    this.croppedLogo = imageBase64;
    this.deleteLogo = false;
  }

  /**
   * Atualiza as configurações do sistema
   */
  updateCompanyDetails(): void {

    if (this.companyDataForm.invalid) {
      return;
    }

    this.unregisterCepListener();
    this.companyDataForm.disable();
    const companyDetails = this.companyDataForm.getRawValue() as CompanyDetails;
    companyDetails.image = this.deleteLogo ? 'delete' : this.croppedLogo;

    this.settingsService.updateCompanyDetails(companyDetails).pipe(takeUntil(this.unsub)).subscribe(() => {

      // Habilita o formulário e força a atualização do token do usuário para atualizar as configurações
      this.companyDataForm.enable();
      this.registerCEPListener();
      this.authService.renewToken();
      this.snackBar.open('Configurações atualizadas com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.companyDataForm.enable();
      this.registerCEPListener();

    });

  }

  /**
   * Cancela a inscrição do listener do input de CEP
   * @private
   */
  private unregisterCepListener(): void {
    this.cepUnsub.next();
  }

  /**
   * Realiza a consulta das configurações
   */
  private loadSettings() {

    this.settingsService.loadCompanyDetails().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.companyDataForm.patchValue(response);
      this.logoSrc = response.image;
      this.registerCEPListener();
      this.status.next('pronto');

    });

  }

  /**
   * Registra o listener para os eventos de valueChange no campo CEP
   * e realiza a consulta do endereço no webservice
   */
  private registerCEPListener() {

    // Adiciona o listener para os value changes do input
    this.companyDataForm.get('cep').valueChanges.pipe(debounceTime(200), takeUntil(this.cepUnsub)).subscribe((value: string) => {

      // Verifica se a string é válida
      if (value !== null && value !== '' && value.length === 9) {

        // Envia a requisição para consultar o CEP no webservice
        this.cepService.findAddressByCEP(value).pipe(takeUntil(this.unsub)).subscribe((response) => {

          // Verifica se teve sucesso
          if (response.ok && !response.body.erro) {

            // Recupera objeto da consulta
            const cepResponse = response.body;

            // Define os valores dos campos
            this.companyDataForm.get('address').setValue(cepResponse.logradouro);
            this.companyDataForm.get('district').setValue(cepResponse.bairro);
            this.companyDataForm.get('complement').setValue(cepResponse.complemento);
            this.companyDataForm.get('city').setValue(cepResponse.localidade.concat(' - ', cepResponse.uf));

          }

        }, () => {

          // Limpa os campos do endereço
          this.companyDataForm.get('address').setValue('');
          this.companyDataForm.get('district').setValue('');
          this.companyDataForm.get('city').setValue('');

        });

      }

    });

  }

}
