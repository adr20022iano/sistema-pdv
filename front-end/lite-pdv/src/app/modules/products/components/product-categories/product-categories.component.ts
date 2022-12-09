import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {DcInput} from '@devap-br/devap-components/input';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {ProductCategory} from '../../models/product-category';
import {ProductsService} from '../../services/products.service';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'lpdv-product-categories',
  templateUrl: './product-categories.component.html',
  styleUrls: ['./product-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsCategoriesComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Se está editando uma categoria ou não */
  editingCategory = false;

  /** Título exibido no sideMenu */
  title: string;

  /** Subtítulo exibido no sideMenu */
  subTitle: string;

  /** Campo nome do formulário */
  @ViewChild('nameInput') nameInput: ElementRef<DcInput>;

  /** A lista das categorias */
  categories = new BehaviorSubject<ProductCategory[]>([]);

  /** Formulário de nova categoria */
  categoryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    favorite: new FormControl()
  });

  /** A categoria que está sendo editada */
  categoryBeingEdited: ProductCategory;

  /** O index da categoria que está sendo editado */
  categoryBeingEditedIndex: number;

  /** Se a integração do catálogo está ativa */
  catalogModule: boolean;

  constructor(private productsService: ProductsService, private sideMenuRef: DcSideMenuRef<ProductsCategoriesComponent>,
              private layoutService: LayoutService, private snackBar: DcSnackBar, private dialog: DcDialog,
              @Inject(SIDE_MENU_DATA) private returnCategory: boolean, private authService: AuthService) {
  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.setTitles();
    this.catalogModule = this.authService.getUserConfig()?.catalogModule;

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

    if (this.editingCategory) {
      this.saveChanges();
    } else {
      this.addCategory();
    }

  }

  /**
   * Altera o formulário para a edição de uma categoria
   * @param categoryIndex Index da categoria que está sendo editada
   * @param category Categoria que está sendo editada
   */
  editCategory(categoryIndex: number, category: ProductCategory) {

    this.editingCategory = true;
    this.categoryBeingEdited = category;
    this.setTitles();
    this.categoryBeingEditedIndex = categoryIndex;
    this.categoryForm.get('name').setValue(category.name);
    this.categoryForm.get('favorite').setValue(category.favorite);
    this.nameInput.nativeElement.focus();

  }

  /**
   * Deleta a categoria informada
   * @param categoryIndex Index da categoria na lista
   * @param category A categoria que será deletada
   */
  deleteCategory(categoryIndex: number, category: ProductCategory) {

    const dlgConfig = new ConfirmationDlgConfig(
      'Excluir categoria?',
      category.name,
      'Essa ação não poderá ser revertida.',
      'Excluir'
    );

    // Abre a janela de confirmação
    this.dialog.open(ConfirmationDlgComponent, {
      data: dlgConfig,
      minWidth: '35%'
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        this.productsService.deleteCategory(category.code).pipe(takeUntil(this.unsub)).subscribe(() => {

          const currentCategories = this.categories.getValue();
          currentCategories.splice(categoryIndex, 1);
          this.categories.next(currentCategories);
          this.checkResults();
          this.snackBar.open('Categoria excluída.', null, {duration: 3500, panelClass: 'sucesso'});

        });

      }

    });

  }

  /** Função trackBy para a lista de categorias */
  categoriesTrackBy(index: number, item: ProductCategory) {
    return item.code;
  }

  ngOnDestroy(): void {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Realiza a consulta das categorias
   */
  private loadCategories() {

    this.productsService.loadCategories().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.categories.next(response);
      this.checkResults();

    }, () => {
      this.status.next('vazio');
    });

  }

  /**
   * Adiciona uma nova categoria
   */
  private addCategory() {

    const categoryName = this.categoryForm.get('name').value as string;
    const favorite = this.categoryForm.get('favorite').value;
    this.productsService.addCategory(categoryName, favorite).pipe(takeUntil(this.unsub)).subscribe(response => {

      const newCategory: ProductCategory = {code: response.code, name: categoryName.trim(), favorite};

      if (this.returnCategory) {
        this.sideMenuRef.close(newCategory);
        return;
      }

      const currentCategories = this.categories.getValue();
      currentCategories.push(newCategory);
      const orderedCategories = currentCategories.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', {sensitivity: 'base'}));
      this.categories.next(orderedCategories);
      this.categoryForm.reset();
      this.categoryForm.enable();
      this.nameInput.nativeElement.focus();
      this.checkResults();
      this.snackBar.open('Categoria adicionada com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.categoryForm.enable();

    });

  }

  /**
   * Salva as alterações de uma categoria
   */
  private saveChanges() {

    const categoryName = this.categoryForm.get('name').value as string;
    const favorite = this.categoryForm.get('favorite').value;
    const editedCategory: ProductCategory = {...this.categoryBeingEdited, name: categoryName.trim(), favorite};

    this.productsService.updateCategory(editedCategory)
      .pipe(takeUntil(this.unsub)).subscribe(() => {

      // Alteramos a categoria dentro do array e emitimos um novo resultado ordenado
      const currentCategories = this.categories.getValue();
      currentCategories.splice(this.categoryBeingEditedIndex, 1, editedCategory);
      this.categories.next(currentCategories.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', {sensitivity: 'base'})));

      this.categoryForm.reset();
      this.categoryForm.enable();
      this.editingCategory = false;
      this.setTitles();
      this.categoryBeingEditedIndex = undefined;
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

    if (this.editingCategory) {

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
