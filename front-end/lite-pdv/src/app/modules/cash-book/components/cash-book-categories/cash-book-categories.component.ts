import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, Validators} from '@angular/forms';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {DcInput} from '@devap-br/devap-components/input';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {ProductsCategoriesComponent} from 'src/app/modules/products/components/product-categories/product-categories.component';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {BookCategory} from '../../models/book-category';
import {CashBookService} from '../../services/cash-book.service';

@Component({
  selector: 'lpdv-cash-book-categories',
  templateUrl: './cash-book-categories.component.html',
  styleUrls: ['./cash-book-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashBookCategoriesComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Se está editando uma categoria ou não */
  updatingCategory = false;

  /** Título exibido no sideMenu */
  title: string;

  /** Subtítulo exibido no sideMenu */
  subTitle: string;

  /** Campo nome do formulário */
  @ViewChild('nameInput') name: ElementRef<DcInput>;

  /** A lista das categorias */
  categories = new BehaviorSubject<BookCategory[]>([]);

  /** Formulário de nova categoria */
  categoryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl(1, [Validators.required])
  });

  /** Campo nome do formulário */
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  /** A categoria que está sendo editada */
  categoryBeingEdited: BookCategory;

  /** O index da categoria que está sendo editado */
  editCategoryIndex: number;

  constructor(private cashBookService: CashBookService, private sideMenuRef: DcSideMenuRef<ProductsCategoriesComponent>,
              private layoutService: LayoutService, private snackBar: DcSnackBar, private dialog: DcDialog) {
  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.setTitles();

    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadCategories();
    });

  }

  /**
   * Verifica se o formulário está válido e qual
   * operação deve realizar na categoria.
   */
  save() {

    if (this.categoryForm.invalid) {
      return;
    }

    this.categoryForm.disable();

    if (this.updatingCategory) {
      this.saveCategoryEdit();
    } else {
      this.addNewCategory();
    }

  }

  /**
   * Altera o formulário para a edição de uma categoria
   * @param indexCategoria Index da categoria que está sendo editada
   * @param categoria Categoria que está sendo editada
   */
  editCategory(indexCategoria: number, categoria: BookCategory) {

    this.updatingCategory = true;
    this.categoryBeingEdited = categoria;
    this.setTitles();
    this.editCategoryIndex = indexCategoria;
    this.categoryForm.get('name').setValue(categoria.name);
    this.categoryForm.get('type').setValue(categoria.type);
    this.name.nativeElement.focus();

  }

  /**
   * Deleta a categoria informada
   * @param categoryIndex Index da categoria na lista
   * @param category A categoria que será deletada
   */
  deleteCategory(categoryIndex: number, category: BookCategory) {

    const dlgConfig = new ConfirmationDlgConfig(
      'Excluir categoria?',
      category.name,
      'Ao excluir uma categoria ela será removida de todos os registros do caixa, porém os registros não serão excluídos.',
      'Excluir'
    );

    // Abre a janela de confirmação
    this.dialog.open(ConfirmationDlgComponent, {data: dlgConfig}).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        this.cashBookService.deleteCategory(category.code).pipe(takeUntil(this.unsub)).subscribe(() => {

          this.removeCashBookCategory(categoryIndex);
          this.snackBar.open('Categoria excluída.', null, {duration: 3500, panelClass: 'sucesso'});

        });

      }

    });

  }

  /** Função trackBy para a lista de categorias */
  categoriesTrackBy(index: number, item: BookCategory) {
    return item.code;
  }

  ngOnDestroy(): void {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Remove uma categoria do caixa
   * @param categoryIndex O índice da categoria
   * @private
   */
  private removeCashBookCategory(categoryIndex: number) {

    const currentCategories = this.categories.getValue();
    currentCategories.splice(categoryIndex, 1);
    this.categories.next(currentCategories);
    this.checkResults();

  }

  /**
   * Realiza a consulta das categorias
   */
  private loadCategories() {

    this.cashBookService.loadCategories().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.categories.next(response);
      this.checkResults();

    }, () => {
      this.status.next('vazio');
    });

  }

  /**
   * Adiciona uma nova categoria
   */
  private addNewCategory() {

    const categoryName = this.categoryForm.get('name').value as string;
    const categoryType = this.categoryForm.get('type').value as 1 | 2;

    this.cashBookService.newCategory(categoryName, categoryType).pipe(takeUntil(this.unsub)).subscribe(response => {

      const newCategory: BookCategory = {code: response.code, name: categoryName.trim(), type: categoryType};
      const currentCategories = this.categories.getValue();
      currentCategories.push(newCategory);
      const orderedCategories = currentCategories.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', {sensitivity: 'base'}));
      this.categories.next(orderedCategories);
      this.formDirective.resetForm();
      this.categoryForm.reset({name: '', type: 1});
      this.categoryForm.enable();
      this.name.nativeElement.focus();
      this.checkResults();
      this.snackBar.open('Categoria adicionada com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.categoryForm.enable();

    });

  }

  /**
   * Salva as alterações de uma categoria
   */
  private saveCategoryEdit() {

    const categoryName = this.categoryForm.get('name').value as string;
    const editCategory: BookCategory = {...this.categoryBeingEdited, name: categoryName.trim()};
    const tipoCategoria = this.categoryForm.get('type').value as 1 | 2;

    this.cashBookService.updateCategory(this.categoryBeingEdited.code, categoryName, tipoCategoria)
      .pipe(takeUntil(this.unsub)).subscribe(() => {

      // Alteramos a categoria dentro do array e emitimos um novo resultado ordenado
      const currentCategories = this.categories.getValue();
      currentCategories.splice(this.editCategoryIndex, 1, editCategory);
      this.categories.next(currentCategories.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', {sensitivity: 'base'})));

      this.formDirective.resetForm();
      this.categoryForm.reset({name: '', type: 1});
      this.categoryForm.enable();
      this.updatingCategory = false;
      this.setTitles();
      this.editCategoryIndex = undefined;
      this.name.nativeElement.focus();
      this.snackBar.open('Categoria atualizada com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.categoryForm.enable();

    });

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

  /**
   * Define o título e o subtítulo da janela baseado se está
   * editando ou não uma categoria.
   */
  private setTitles() {

    if (this.updatingCategory) {

      this.title = 'Editar categoria';
      this.subTitle = 'Editando categoria: '.concat(this.categoryBeingEdited.name);

    } else {

      this.title = 'Nova categoria';
      this.subTitle = 'Informe os dados para adicionar uma nova categoria';

    }

  }

  /**
   * Define a exibição da lista após o carregamento ou alguma operação
   */
  private checkResults() {
    this.status.next(this.categories.getValue().length > 0 ? 'pronto' : 'vazio');
  }

}
