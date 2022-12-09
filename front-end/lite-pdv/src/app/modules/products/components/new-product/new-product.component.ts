import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, FormGroupDirective, Validators} from '@angular/forms';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {DcInput} from '@devap-br/devap-components/input';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenu, DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, forkJoin, merge, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {ProductCategory} from '../../models/product-category';
import {NewProduct} from '../../models/new-product';
import {Product} from '../../models/product';
import {UpdateProduct} from '../../models/update-product';
import {ProductsService} from '../../services/products.service';
import {NewStockHandlingComponent} from '../new-stock-handling/new-stock-handling.component';
import {SCALE_DATE_TIPE} from '../../models/scale-date-type.enum';
import {ProductsCategoriesComponent} from '../product-categories/product-categories.component';
import {AuthService} from '../../../core/services/auth.service';
import {ImageUploaderComponent} from '../../../shared/components/image-uploader/image-uploader.component';
import {BarcodeHelper} from '../../../shared/helpers/barcode-helper';

const BAR_CODE_REGEX = /^(?!2.*$).*/;

export interface NewProductSideMenuData {
  /** Opcional - Informado apenas quando um produto está sendo editado */
  product?: Product;

  /** Se a criação ou edição é de um produto de edição */
  production: boolean;

  /** Se deve duplicar o produto que está sendo editado */
  duplicate?: boolean;
}

export function IntegerValidator(control: AbstractControl) {

  const value: any = control.value;

  if (Number.isFinite(value)) {
    return Number.isInteger(value) ? null : {integer: true};
  }

  return null;

}

@Component({
  selector: 'lpdv-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewProductComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Lista de categorias */
  categories = new BehaviorSubject<ProductCategory[]>([]);

  /** Se está editando um produto ou não */
  editingProduct = false;

  /** O produto que está sendo editado */
  productBeingEdited: Product;

  /** Se está duplicando um produto ou não */
  duplicatingProduct = false;

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Título exibido no sideMenu */
  title: string;

  /** Subtítulo exibido no sideMenu */
  subTitle: string;

  /** Formulário do produto */
  productForm: FormGroup;

  /** O estado padrão do formulário */
  FORM_DEFAULT_STATE: any;

  /** Directive do formulário, usada para redefinir os valores do formulário */
  @ViewChild(FormGroupDirective) productFormDirective: FormGroupDirective;

  /** Referencia do input de nome, usado para focar após adicionar um produto */
  @ViewChild('nameInput') nameInput: ElementRef<DcInput>;

  /** Referência do campo de quantidade */
  @ViewChild('quantityInput') quantityInput: ElementRef<DcInput>;

  /** Referência do uploader de fotos */
  @ViewChild('uploader') uploader: ImageUploaderComponent;

  /** Se o valor de venda é inferior */
  inferiorSaleValue: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /** Se o valor de venda externa é inferior ao valor de custo */
  inferiorExternalSaleValue: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /** Se a visualização atual é mobile */
  isMobile = false;

  /** Se deve exibir ou não os campos de integração de balança */
  showScaleIntegration: boolean;

  /** Se deve exibir ou não os campos de integração de catálogo */
  showCatalogIntegration: boolean;

  /** Se a listagem dos clubes deve ser recarregada quando o menu for fechado */
  shouldReloadOnClose = new BehaviorSubject(false);

  /** A url da imagem retornada pelo webservice e que será exibida como foto do produto. */
  productImageSrc: string;

  /** Se o sistema está com fotos dos produtos habilitadas */
  useProductPictures: boolean;

  /** Se o sistema está realizando cálculo de estoque ou não */
  calculateStock: boolean;

  /** Se usa o módulo de vendas externas ou não */
  externalSalesModule: boolean;

  /** String em base64 da imagem do produto selecionada para envio. */
  private croppedImage: string;

  /** Se deve deletar a imagem atual do produto */
  private deleteImage: boolean;

  constructor(private sideMenuRef: DcSideMenuRef<NewProductComponent>, @Inject(SIDE_MENU_DATA) public data: NewProductSideMenuData,
              private layoutService: LayoutService, private snackBar: DcSnackBar, private dialog: DcDialog,
              private produtosService: ProductsService, private formBuilder: FormBuilder, private sideMenu: DcSideMenu,
              private authService: AuthService) {

    if (data && data.product && data.duplicate) {
      this.productBeingEdited = data.product;
      this.duplicatingProduct = true;
    } else if (data && data.product) {
      this.editingProduct = true;
      this.productBeingEdited = data.product;
    } else {
      this.status.next('pronto');
    }

    this.initForm();
    this.setTitles();

  }

  /**
   * Retorna se o input de quantidade deve estar no modo de apenas leitura
   */
  get quantityReadOnly(): boolean {
    return this.editingProduct;
  }

  /**
   * Se deve exibir a coluna de quantidade ou não
   */
  get showQuantityInput(): boolean {
    return this.calculateStock && !this.data.production;
  }

  /**
   * Se deve exibir o campo de custo ou não
   */
  get showCost(): boolean {
    return !this.data.production;
  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.setIntegrations();
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadProductData();
    });

    // Inicializa a verificação de valor de venda abaixo do custo
    merge(this.productForm.get('value').valueChanges, this.productForm.get('cost').valueChanges)
      .pipe(debounceTime(250), takeUntil(this.unsub)).subscribe(() => {

      const costValue = this.productForm.get('cost').value;
      const saleValue = this.productForm.get('value').value;
      this.inferiorSaleValue.next(saleValue < costValue);

    });

    if (this.externalSalesModule) {

      // Inicializa a verificação de valor de venda abaixo do custo
      merge(this.productForm.get('externalSaleValue').valueChanges, this.productForm.get('cost').valueChanges)
        .pipe(debounceTime(250), takeUntil(this.unsub)).subscribe(() => {

        const costValue = this.productForm.get('cost').value;
        const externalSaleValue = this.productForm.get('externalSaleValue').value;
        this.inferiorExternalSaleValue.next(externalSaleValue < costValue);

      });

    }

    // Adiciona ou remove o validador de quantidade unitária do campo de estoque
    this.productForm.get('unit').valueChanges.pipe(takeUntil(this.unsub)).subscribe(value => {

      if (value === 'UNID') {

        this.productForm.get('stock').setValidators(IntegerValidator);
        this.productForm.get('stock').updateValueAndValidity();

      } else {

        this.productForm.get('stock').clearValidators();
        this.productForm.get('stock').updateValueAndValidity();

      }

    });

    // Inscreve para atualizar o valor do resultado do `backdropCloseResult` sempre que houver uma alteração.
    this.shouldReloadOnClose.asObservable().pipe(takeUntil(this.unsub)).subscribe(shouldReload => {
      this.sideMenuRef.backdropCloseResult = shouldReload;
    });

  }

  /**
   * Salva as edições ou adiciona um novo produto
   */
  saveProduct() {

    if (this.editingProduct) {

      this.updateProduct();

    } else {

      this.addNewProduct();

    }

  }

  /**
   * Marca a foto do produto para remoção;
   */
  removePicture(): void {
    this.croppedImage = '';
    this.deleteImage = true;
  }

  /**
   * Define a imagem do produto em base64.
   * @param imageBase64 A imagem em base64 retornada após o corte.
   */
  setPicture(imageBase64: string) {
    this.croppedImage = imageBase64;
    this.deleteImage = false;
  }

  /**
   * Atalho para focar o campo quantidade ou abrir a janela de movimentação de estoque
   */
  @HostListener('document:keydown.F3', ['$event'])
  focusQuantity(event?: KeyboardEvent) {
    event?.preventDefault();

    if (this.quantityReadOnly) {
      this.editProductStock();
      return;
    }

    this.quantityInput.nativeElement.focus();
  }

  /**
   * Adiciona um novo produto
   */
  addNewProduct() {

    const formData = this.productForm.getRawValue() as NewProduct;

    if (this.productForm.invalid) {
      return;
    }

    this.toggleForm(false);

    // Define se o produto é de produção ou não
    formData.production = this.data.production;
    formData.image = this.croppedImage;

    // Envia a requisição para adicionar o produto
    this.produtosService.addProduct(formData).pipe(takeUntil(this.unsub)).subscribe((() => {

      this.shouldReloadOnClose.next(true);
      this.resetForm();
      this.toggleForm(true);
      this.nameInput.nativeElement.focus();
      this.snackBar.open('Produto adicionado com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }), () => {

      // Habilita o formulário
      this.toggleForm(true);

    });

  }

  /**
   * Realiza a atualização de um produto
   */
  updateProduct() {

    if (this.productForm.invalid) {
      return;
    }

    this.productForm.disable();
    const formData = this.productForm.getRawValue() as UpdateProduct;
    formData.code = this.data.product.code;
    formData.image = this.deleteImage ? 'delete' : this.croppedImage;

    this.produtosService.updateProduct(formData).pipe(takeUntil(this.unsub)).subscribe((() => {

      this.snackBar.open('Produto atualizado com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
      this.sideMenuRef.close(true);

    }), () => {

      this.productForm.enable();

    });

  }

  /**
   * Excluir o produto
   */
  deleteProduct() {

    // Dados para confirmação
    const config = new ConfirmationDlgConfig(
      'Excluir produto?',
      this.productBeingEdited.name,
      'Esta operação não poderá ser revertida.',
      'Excluir');

    // Abre a janela de confirmação
    this.dialog.open(ConfirmationDlgComponent, {
      data: config,
      minWidth: '35%'
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        this.produtosService.deleteProduct(this.data.product.code).pipe(takeUntil(this.unsub)).subscribe(() => {

          this.snackBar.open('Produto excluído com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
          this.sideMenuRef.close(true);

        });

      }

    });

  }

  /**
   * Abre o sideMenu para adicionar uma nova categoria.
   */
  newCategory(event: MouseEvent): void {

    // Paramos a propagação do evento para evitar que o select abra
    event.stopPropagation();

    this.sideMenu.open(ProductsCategoriesComponent, {data: true}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((result: ProductCategory) => {

        if (result && result.code) {

          const currentCategories = this.categories.getValue();
          currentCategories.push(result);
          this.categories.next(currentCategories);
          this.productForm.get('categoryCode').setValue(result.code);

        }

      });

  }

  ngOnDestroy(): void {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Gera um código de barras baseado no unix time atual para o produto
   */
  generateBarCode(): void {

    const currentMillis = new Date().getTime();
    // Cria o código de barras de 12 dígitos
    const randomBarCode = '4'.concat(currentMillis.toString()).substring(0, 12);
    const barcodeVerificationDigit = BarcodeHelper.generateBarcodeCheckDigit(randomBarCode);
    this.productForm.get('barCode').setValue(randomBarCode.concat(barcodeVerificationDigit.toString()));

  }

  /**
   * Abre a janela para a edição do produto
   */
  private editProductStock(): void {

    this.sideMenu.open(NewStockHandlingComponent, {data: {product: this.productBeingEdited, stockLoss: false}})
      .afterClosed().subscribe((newStock: number) => {

      if (Number.isFinite(newStock)) {

        // Quando alteramos o estoque devemos atualizar o formulário e
        // emitir o evento para atualizar o estoque no produto exibido na lista;
        this.productForm.get('stock').setValue(newStock);
        this.productBeingEdited.stock = newStock;
        this.shouldReloadOnClose.next(true);

      }

    });

  }

  /**
   * Carrega os dados para o formulário, se estiver editando um produto carrega os dados do produto
   * e as categorias, se não carrega apenas as categorias.
   */
  private loadProductData() {

    if (this.editingProduct || this.duplicatingProduct) {

      forkJoin([this.produtosService.loadCategories(), this.produtosService.getProductInfo(this.productBeingEdited.code)])
        .pipe(takeUntil(this.unsub)).subscribe(response => {

        this.categories.next(response[0]);
        this.productForm.patchValue(response[1]);
        this.productImageSrc = (response[1].image as any)?.v;

        // Se estamos duplicando um produto alguns parâmetros devem ser alterados
        if (this.duplicatingProduct) {
          this.resetDuplicationValues();
        }

        this.status.next('pronto');

        // Foca o campo nome
        setTimeout(() => {
          this.nameInput.nativeElement.focus();
        }, 100);

      }, () => {

        // Fecha o menu
        this.sideMenuRef.close();

      });

    } else {

      this.produtosService.loadCategories().pipe(takeUntil(this.unsub)).subscribe(response => {

        this.categories.next(response);
        this.status.next('pronto');

      }, () => {

        // Fecha o menu
        this.sideMenuRef.close();

      });

    }

  }

  /**
   * Redefine a imagem do produto e alguns valores do formulário se estiver duplicando um produto
   * @private
   */
  private resetDuplicationValues(): void {
    this.productImageSrc = undefined;
    this.productForm.get('barCode').setValue('');
    this.productForm.get('stock').setValue('');
  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '900px', '100%');
      this.isMobile = isMobile;
    });

  }

  /**
   * Inicializa o formulário baseado no seu estado padrão
   */
  private initForm() {

    this.FORM_DEFAULT_STATE = {
      name: ['', Validators.required],
      cost: [''],
      value: [''],
      externalSaleValue: [''],
      stock: ['', IntegerValidator],
      categoryCode: [],
      production: [false, Validators.required],
      barCode: ['', Validators.pattern(BAR_CODE_REGEX)],
      shelfLife: [''],
      scaleDate: [null],
      unit: ['UNID'],
      sale: [true],
      location: [''],
      details: [''],
      catalogSale: [],
      catalogDetails: []
    };

    this.productForm = this.formBuilder.group(this.FORM_DEFAULT_STATE);

  }

  /**
   * Redefine o formulário aos seus valores padrões
   */
  private resetForm() {

    this.productFormDirective.resetForm({
      name: '',
      cost: '',
      value: '',
      externalSaleValue: '',
      stock: '',
      categoryCode: '',
      barCode: '',
      shelfLife: '',
      scaleDate: SCALE_DATE_TIPE.SHELF_LIFE,
      unit: 'UNID',
      sale: true,
      production: false,
      details: '',
      catalogSale: false,
      catalogDetails: ''
    });

    // Redefine os parâmetros do envio da imagem
    if (this.useProductPictures) {

      this.deleteImage = false;
      this.croppedImage = undefined;
      this.productImageSrc = undefined;
      this.uploader.reset();

    }

  }

  /**
   * Define o título e o subtítulo da janela
   */
  private setTitles() {

    if (this.editingProduct) {

      this.title = 'Editar Produto'.concat(this.data.production ? ' de Produção' : '');
      this.subTitle = 'Editando produto'.concat(this.data.production ? ' de produção' : '', ': ', this.productBeingEdited.name);

    } else {

      this.title = 'Novo Produto'.concat(this.data.production ? ' de Produção' : '');
      this.subTitle = 'Informe os dados para adicionar um novo produto'.concat(this.data.production ? ' de produção' : '');

    }

  }

  /**
   * Habilita ou desabilita o formulário de produtos dependendo do parâmetro informado
   * @param enable Se deve habilitar o formulário ou não
   */
  private toggleForm(enable: boolean) {

    // Se deve habilitar ou desabilitar o formulário
    if (enable) {

      // Verifica se deve habilitar todos os formulários ou todos exceto o de quantidade
      if (!this.editingProduct && this.data.production) {

        // Itera entre os controles do formGroup
        Object.keys(this.productForm.controls).forEach(controlName => {

          // Habilita aqueles que não são de quantidade
          if (controlName !== 'qtd') {
            this.productForm.controls[controlName].enable();
          }

        });

        return;

      }

      // Habilita o formulário
      this.productForm.enable();

      return;

    }

    // Desabilita o formulário
    this.productForm.disable();

  }

  /**
   * Define se exibe ou não os campos de integração baseado nas configurações do sistema.
   * @private
   */
  private setIntegrations(): void {

    const userConfig = this.authService.getUserConfig();
    this.showCatalogIntegration = userConfig?.catalogModule || false;
    this.showScaleIntegration = userConfig?.scaleIntegration || false;
    this.useProductPictures = userConfig?.useProductImage || false;
    this.calculateStock = userConfig?.calculateStock || false;
    this.externalSalesModule = userConfig?.externalSalesModule || false;

  }

}
