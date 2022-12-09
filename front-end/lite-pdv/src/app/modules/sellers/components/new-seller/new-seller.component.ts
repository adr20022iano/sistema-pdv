import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {FormControl, FormGroup, FormGroupDirective, Validators} from '@angular/forms';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {Seller} from '../../models/seller';
import {SellersService} from '../../services/sellers.service';
import {takeUntil} from 'rxjs/operators';
import {DcInput} from '@devap-br/devap-components/input';

@Component({
  selector: 'lpdv-new-seller',
  templateUrl: './new-seller.component.html',
  styleUrls: ['./new-seller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewSellerComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Se está editando um vendedor ou não */
  editingSeller = false;

  /** Título exibido no sideMenu */
  title: string;

  /** Se a listagem dos clubes deve ser recarregada quando o menu for fechado */
  shouldReloadOnClose = new BehaviorSubject(false);

  /** Referência do input do nome */
  @ViewChild('nameInput') nameInput: ElementRef<DcInput>;

  /** Referência do formControl */
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  /** Subtítulo exibido no sideMenu */
  subTitle: string;

  /** Formulário de cadastro do vendedor */
  sellerForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(@Inject(SIDE_MENU_DATA) public sellerBeingEdited: Seller, private sideMenuRef: DcSideMenuRef<NewSellerComponent>,
              private sellersService: SellersService, private snackBar: DcSnackBar, private layoutService: LayoutService) {

    // Verifica se está editando um vendedor
    if (sellerBeingEdited) {

      // Define que está editando um vendedor para assim que o sideMenu acabar de abrir,
      // carregar os dados do vendedor
      this.editingSeller = true;
      this.sellerForm.patchValue(sellerBeingEdited);

    }

    // Define os títulos
    this.setTitles();

  }

  ngOnInit(): void {

    // Inscreve para os eventos de mudança na visualização
    this.initLayoutChanges();

    // Inscreve para atualizar o valor do resultado do `backdropCloseResult` sempre que houver uma alteração.
    this.shouldReloadOnClose.asObservable().pipe(takeUntil(this.unsub)).subscribe(shouldReload => {
      this.sideMenuRef.backdropCloseResult = shouldReload;
    });

  }

  /**
   * Salva o vendedor
   */
  save() {

    if (this.sellerForm.invalid) {
      return;
    }

    this.sellerForm.disable();

    // Recupera os dados informados
    const newSeller = this.sellerForm.getRawValue() as Seller;

    // Se estiver editando um vendedor, define o código para a requisição
    if (this.editingSeller) {
      newSeller.code = this.sellerBeingEdited.code;
    }

    // Salva o vendedor
    this.sellersService.saveSeller(newSeller).pipe(takeUntil(this.unsub))
      .subscribe(() => {

        // Exibe a mensagem de sucesso
        const msg = this.editingSeller ? 'Vendedor atualizado.' : 'Vendedor adicionado.';
        this.snackBar.open(msg, null, {duration: 3500, panelClass: 'sucesso'});

        if (this.editingSeller) {
          this.sideMenuRef.close(true);
          return;
        }

        this.shouldReloadOnClose.next(true);
        this.sellerForm.reset();
        this.formGroupDirective.resetForm();
        this.sellerForm.enable();
        this.nameInput.nativeElement.focus();

      }, () => {

        // Habilita o formulário
        this.sellerForm.enable();

      });

  }

  ngOnDestroy() {
    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();
  }

  /**
   * Define o título e o subtítulo da janela
   */
  private setTitles() {

    if (this.editingSeller) {

      this.title = 'Editar Vendedor';
      this.subTitle = 'Editando vendedor: '.concat(this.sellerBeingEdited.name);

    } else {

      this.title = 'Novo Vendedor';
      this.subTitle = 'Informe os dados para adicionar um novo vendedor';

    }

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

}
