import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CashBookService} from '../../services/cash-book.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {CashBookEntry} from '../../models/cash-book-entry';
import {BookCategory} from '../../models/book-category';
import {DcSelectChange} from '@devap-br/devap-components/select';
import {CustomValidators} from 'src/app/modules/shared/validators/custom-validators';
import {DcInput} from '@devap-br/devap-components/input';

@Component({
  selector: 'lpdv-new-cash-book-entry',
  templateUrl: './new-cash-book-entry.component.html',
  styleUrls: ['./new-cash-book-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewCashBookEntryComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Formulário de novo lançamento */
  newEntryForm = new FormGroup({
    history: new FormControl('', [Validators.required]),
    value: new FormControl(0, [Validators.required, CustomValidators.zero]),
    categoryCode: new FormControl('')
  });

  /** Lista de categorias */
  categories: BookCategory[];

  /** Se a listagem dos clubes deve ser recarregada quando o menu for fechado */
  shouldReloadOnClose = new BehaviorSubject(false);

  /** Referência do input de histórico */
  @ViewChild('historyInput') historyInput: ElementRef<DcInput>;

  constructor(private layoutService: LayoutService, private sideMenuRef: DcSideMenuRef<NewCashBookEntryComponent>,
              private cashBookService: CashBookService, private snackBar: DcSnackBar) {
  }

  ngOnInit(): void {

    // Inscreve para os eventos de mudança na visualização
    this.initLayoutChanges();

    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {

      // Realiza a consulta das categorias
      this.cashBookService.loadCategories().pipe(takeUntil(this.unsub)).subscribe(response => {

        // Recupera as categorias, excluindo a categoria 1 de vendas
        this.categories = response.filter(category => category.code !== 1);

      }, () => {
        this.sideMenuRef.close();
      });

    });

    // Inscreve para atualizar o valor do resultado do `backdropCloseResult` sempre que houver uma alteração.
    this.shouldReloadOnClose.asObservable().pipe(takeUntil(this.unsub)).subscribe(shouldReload => {
      this.sideMenuRef.backdropCloseResult = shouldReload;
    });

  }

  /**
   * Altera o valor para negativo ou positivo baseado no tipo da categoria selecionada
   * @param event Evento emitido pelo select
   */
  categoryChange(event: DcSelectChange) {

    const categoryCode = event.value;
    const category = this.categories.find(cat => cat.code === categoryCode);
    const value = this.newEntryForm.get('value').value as number;

    if (category) {

      if (category.type === 1) {

        // Categoria de despesas
        this.newEntryForm.get('value').setValue(-Math.abs(value));

      } else if (category.type === 2) {

        // Categoria de receitas
        this.newEntryForm.get('value').setValue(Math.abs(value));

      }

    }

  }

  /**
   * Retorna a classe a ser aplicada no ícone da categoria
   */
  getIconClass(category: BookCategory) {

    switch (category.type) {

      case 1:

        return 'despesa';

      case 2:

        return ['receita', 'rotate-180'];

    }

  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Salva o lançamento do caixa
   */
  addEntry() {

    if (this.newEntryForm.invalid) {
      return;
    }

    this.newEntryForm.disable();

    // Recupera os dados do formulário
    const formData = this.newEntryForm.getRawValue() as CashBookEntry;

    // Cria a nova operação
    const newEntry: CashBookEntry = {
      categoryCode: formData.categoryCode ? formData.categoryCode : null,
      value: formData.value,
      history: formData.history,
      date: new Date(),
      code: null,
      category: this.getCategoryName(formData.categoryCode)
    };

    this.cashBookService.newEntry(newEntry).pipe(takeUntil(this.unsub))
      .subscribe(() => {

        this.shouldReloadOnClose.next(true);
        this.newEntryForm.reset();
        this.newEntryForm.enable();
        this.historyInput.nativeElement.focus();
        this.snackBar.open('Lançamento adicionado.', null, {duration: 3500, panelClass: 'sucesso'});

      }, () => {

        // Habilita o formulário
        this.newEntryForm.enable();

      });

  }

  /**
   * Retorna o nome de uma categoria
   */
  private getCategoryName(codCategoria: number): string {

    const categoria = this.categories.find(cat => cat.code === codCategoria);

    if (categoria) {

      return categoria.name;

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
