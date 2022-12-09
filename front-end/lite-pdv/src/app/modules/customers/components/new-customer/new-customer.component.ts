import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {CepService} from '../../../shared/services/cep.service';
import {Customer} from '../../models/customer';
import {CustomersService} from '../../services/customers.service';
import {AuthService} from '../../../core/services/auth.service';
import {DcInput} from '@devap-br/devap-components/input';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {ConfirmationDlgComponent} from '../../../shared/components/confirmation-dlg/confirmation-dlg.component';
import {ConfirmationDlgConfig} from '../../../shared/components/confirmation-dlg/confirmation-dlg-config';
import {InputHelper} from '@devap-br/devap-components';

/**
 * Pattern para criação da nova senha
 */
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-zA-Z])(?=.{8,})/;

export interface NewCustomerSideMenuData {
  customerForEdition?: Customer;
  returnCustomer?: boolean;
}

@Component({
  selector: 'lpdv-new-costumer',
  templateUrl: './new-costumer.component.html',
  styleUrls: ['./new-costumer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewCustomerComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Se está editando um cliente ou não */
  editingCustomer = false;

  /** Título exibido no sideMenu */
  title: string;

  /** Subtítulo exibido no sideMenu */
  subTitle: string;

  /** Se está carregando o cliente ou não */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Se o valor informado no campo documento é um cnpj ou não */
  isCNPJ = false;

  /** Formulário de cadastro do cliente */
  customerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    nickname: new FormControl(''),
    document: new FormControl(''),
    phone: new FormControl(''),
    creditLimit: new FormControl(),
    cep: new FormControl(''),
    city: new FormControl(''),
    address: new FormControl(''),
    district: new FormControl(''),
    number: new FormControl(''),
    complement: new FormControl(''),
    catalogAccess: new FormControl(),
    blockedSale: new FormControl(),
    email: new FormControl('', [Validators.email]),
    note: new FormControl(),
    password: new FormControl('', [Validators.pattern(PASSWORD_PATTERN)])
  });

  /** Se deve exibir os campos de integração do catálogo. */
  showCatalogIntegration: boolean;

  /** Se a listagem dos clubes deve ser recarregada quando o menu for fechado */
  shouldReloadOnClose = new BehaviorSubject(false);

  /** Referência do input de nome */
  @ViewChild('nameInput') nameInput: ElementRef<DcInput>;

  constructor(@Inject(SIDE_MENU_DATA) public data: NewCustomerSideMenuData, private sideMenuRef: DcSideMenuRef<NewCustomerComponent>,
              private customersService: CustomersService, private snackBar: DcSnackBar, private cepService: CepService,
              private layoutService: LayoutService, private authService: AuthService, private dialog: DcDialog,
              private cdr: ChangeDetectorRef) {

    // Verifica se está editando um cliente
    if (data?.customerForEdition) {

      // Define que está editando um cliente para assim que o sideMenu acabar de abrir,
      // carregar os dados do cliente
      this.editingCustomer = true;

    } else {

      this.status.next('pronto');
      this.registerCPNJListener();

    }

    // Define os títulos
    this.setTitles();

  }

  ngOnInit(): void {

    // Inscreve para os eventos de mudança na visualização
    this.initLayoutChanges();
    this.setIntegrations();
    this.initAutocomplete();

    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {

      // Se estiver editando um cadastro, realiza a consulta após abrir a janela
      if (this.editingCustomer) {

        // Realiza a consulta do cadastro
        this.loadCustomerInfo(this.data.customerForEdition.code);

      }

    });

    // Registra a consulta do cep
    this.registerCEPListener();

    // Inscreve para atualizar o valor do resultado do `backdropCloseResult` sempre que houver uma alteração.
    this.shouldReloadOnClose.asObservable().pipe(takeUntil(this.unsub)).subscribe(shouldReload => {
      this.sideMenuRef.backdropCloseResult = shouldReload;
    });


  }

  /**
   * Salva o cliente
   */
  save() {

    // Verifica se o formulário está válido
    if (this.customerForm.invalid) {
      return;
    }

    // Desabilita o formulário
    this.customerForm.disable({emitEvent: false});

    // Recupera os dados informados
    const newCustomer = this.customerForm.getRawValue() as Customer;

    // Verifica se está editando ou salvando um cliente
    if (this.editingCustomer) {
      newCustomer.code = this.data.customerForEdition.code;
    }

    // Adiciona o cliente
    this.customersService.saveCustomer(newCustomer).pipe(takeUntil(this.unsub))
      .subscribe((response) => {

        // Exibe a mensagem de sucesso
        const mensagem = this.editingCustomer ? 'Cliente atualizado.' : 'Cliente adicionado.';
        this.snackBar.open(mensagem, null, {duration: 3500, panelClass: 'sucesso'});

        if (this.editingCustomer) {
          this.sideMenuRef.close(true);
          return;
        }

        if (this.data?.returnCustomer) {
          newCustomer.code = response.code;
          this.sideMenuRef.close(newCustomer);
          return;
        }

        this.shouldReloadOnClose.next(true);
        this.customerForm.reset();
        this.customerForm.enable();
        this.nameInput.nativeElement.focus();

      }, () => {

        // Habilita o formulário
        this.customerForm.enable({emitEvent: false});

      });

  }

  /**
   * Realiza a consulta do cadastro durante a edição
   */
  loadCustomerInfo(customerCode: number) {

    // Define que está carregando
    this.status.next('carregando');

    this.customersService.getCustomerInfo(customerCode).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Recupera os dados do cliente
      this.customerForm.patchValue(response, {emitEvent: false});

      // Define que está carregado
      this.status.next('pronto');

    }, () => {

      // Exibe a mensagem de erro
      this.snackBar.open('Erro ao consultar cliente para edição, tente novamente.', null, {
        panelClass: 'falha',
        duration: 3500
      });

      // Fecha o sideMenu
      this.sideMenuRef.close();

    });

  }

  ngOnDestroy() {
    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();
  }

  /**
   * Abre a mensagem de confirmação para remover o cliente
   */
  deleteCustomer(): void {

    const dlgConfig: ConfirmationDlgConfig = new ConfirmationDlgConfig(
      'Excluir cliente?',
      this.data.customerForEdition.name,
      '1 - Ao excluir um cliente ele será removido do registro das vendas, porém as vendas serão mantidas.',
      'Confirmar', 'Cancelar', true, null, '2 - Todos os orçamentos do cliente serão excluídos.'
    );

    // Abre a janela de confirmação
    this.dialog.open(ConfirmationDlgComponent, {data: dlgConfig}).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        // Envia a requisição para deletar o cliente
        this.customersService.deleteCustomer(this.data.customerForEdition.code).pipe(takeUntil(this.unsub)).subscribe(() => {

          this.snackBar.open('Cliente excluído.', null, {duration: 3500, panelClass: 'sucesso'});
          this.sideMenuRef.close(true);

        });

      }

    });

  }

  /**
   * Realiza a consulta do cnpj informado
   */
  consultCNPJ(): void {

    if (this.editingCustomer) {
      return;
    }

    const cnpj = this.customerForm.get('document').value;
    const cnpjDigits = InputHelper.onlyDigits(cnpj);
    this.customersService.consultCNPJ(cnpjDigits).pipe(takeUntil(this.unsub)).subscribe(response => {

      if (!response.active) {
        this.snackBar.open('O CNPJ informado não está ativo.', null, {duration: 3000, panelClass: 'falha'});
      }

      this.customerForm.patchValue(response);
      const activity = `Atividade principal: `.concat(response.activity?.code, ' - ', response.activity?.text);
      this.customerForm.get('note').setValue(activity);

    });

  }

  /**
   * Registra a consulta de cnpj.
   * @private
   */
  private registerCPNJListener(): void {

    // Adiciona o listener para os value changes do input
    this.customerForm.get('document').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe((value: string) => {

      // Utiliza apenas os dígitos para consultar o cnpj
      const cnpjDigits = InputHelper.onlyDigits(value);
      this.isCNPJ = InputHelper.validateCNPJ(cnpjDigits);
      this.cdr.detectChanges();

    });

  }

  // noinspection DuplicatedCode
  /**
   * Registra o listener para os eventos de valueChange no campo CEP
   * e realiza a consulta do endereço no webservice
   */
  private registerCEPListener() {

    // Adiciona o listener para os value changes do input
    this.customerForm.get('cep').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe((value: string) => {

      // Verifica se a string é válida
      if (value !== null && value !== '' && value.length === 9) {

        // Envia a requisição para consultar o CEP no webservice
        this.cepService.findAddressByCEP(value).pipe(takeUntil(this.unsub)).subscribe((response) => {

          // Verifica se teve sucesso
          if (response.ok && !response.body.erro) {

            // Recupera objeto da consulta
            const cepResponse = response.body;

            // Define os valores dos campos
            this.customerForm.get('address').setValue(cepResponse.logradouro);
            this.customerForm.get('district').setValue(cepResponse.bairro);
            this.customerForm.get('complement').setValue(cepResponse.complemento);
            this.customerForm.get('city').setValue(cepResponse.localidade.concat(' - ', cepResponse.uf));

          }

        }, () => {

          // Limpa os campos do endereço
          this.customerForm.get('address').setValue('');
          this.customerForm.get('district').setValue('');
          this.customerForm.get('city').setValue('');

        });

      }

    });

  }

  /**
   * Define o título e o subtítulo da janela
   */
  private setTitles() {

    if (this.editingCustomer) {

      this.title = 'Editar Cliente';
      this.subTitle = 'Editando cliente: '.concat(this.data.customerForEdition.name);

    } else {

      this.title = 'Novo Cliente';
      this.subTitle = 'Informe os dados para adicionar um novo cliente';

    }

  }

  /**
   * Inicia o autocomplete de ruas.
   * @private
   */
  private initAutocomplete(): void {

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '900px', '100%');
    });

  }

  /**
   * Define se exibe ou não os campos de integração baseado nas configurações do sistema.
   * @private
   */
  private setIntegrations(): void {

    const userConfig = this.authService.getUserConfig();
    this.showCatalogIntegration = (userConfig?.catalogModule && userConfig?.admin) || false;

  }

}
