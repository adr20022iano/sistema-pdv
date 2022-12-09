import {ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective} from '@angular/forms';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {DcInput} from '@devap-br/devap-components/input';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {Product} from 'src/app/modules/products/models/product';
import {ProductsService} from 'src/app/modules/products/services/products.service';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {SaleProduct} from '../../models/sale-product';
import {PRODUCT_SALE_TYPE} from 'src/app/modules/products/models/product-sale-type.enum';
import {DcAutocompleteSelectedEvent} from '@devap-br/devap-components';
import {HttpErrorResponse} from '@angular/common/http';
import {CustomValidators} from '../../../shared/validators/custom-validators';
import {NewSaleService} from '../../services/new-sale.service';
import {AuthService} from '../../../core/services/auth.service';

const BARCODE_REGEX = /^\d{8,14}$/;

@Component({
  selector: 'lpdv-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NewSaleService]
})
export class NewSaleComponent implements OnInit, OnDestroy {

  /** Lista dos produtos do autocomplete */
  autocompleteProducts = new BehaviorSubject<Product[]>([]);

  /** Formulário para adicionar um novo produto à venda */
  productForm = new FormGroup({
    product: new FormControl('', CustomValidators.objectKeyValidator('code', true)),
    quantity: new FormControl(),
  });

  /** Input do autocomplete de produtos. */
  @ViewChild('productInput') productInput: ElementRef<DcInput>;

  /** FormGroupDirective do formulário de produtos. */
  @ViewChild(FormGroupDirective) productFormGroupDirective: FormGroupDirective;

  /** Input de quantidade */
  @ViewChild('quantityInput') quantityInput: ElementRef<DcInput>;

  /** O número de casas decimais permitidas ao informar a quantidade de um produto */
  decimalPlaces = 3;

  /** Se deve exibir a imagem do produto ou não */
  displayProductsImages: boolean;

  /** Se o sistema calcula estoque ou não */
  calculateStock: boolean;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private productsService: ProductsService, private snackBar: DcSnackBar, private dialog: DcDialog,
              private newSaleService: NewSaleService, private authService: AuthService) {

    // Redefine o formulário de produto junto ao serviço de nova venda
    this.newSaleService.onServiceReset().pipe(takeUntil(this.unsub)).subscribe(() => this.resetProductForm());

    // Configurações de exibição dos produtos
    const userConfig = this.authService.getUserConfig();
    this.displayProductsImages = userConfig?.useProductImage;
    this.calculateStock = userConfig?.calculateStock;

    // Recupera se está salvando uma venda ou não
    this.newSaleService.saving().pipe(takeUntil(this.unsub)).subscribe(saving => {
      saving ? this.productForm.disable() : this.productForm.enable();
    });

  }

  ngOnInit(): void {
    this.initProductsAutocomplete();
  }

  /**
   * Adiciona um produto na venda.
   */
  addProduct() {

    const formData = this.productForm.getRawValue();
    const productQuantity = formData.quantity || 1;

    // Precisamos verificar se o produto está sendo adicionado, usando um objeto
    // ou o código de barras
    if (BARCODE_REGEX.test(formData.product)) {

      // Adicionar produto por código de barras
      this.addProductViaBarCode(formData.product, formData.quantity);

      // Redefine o formulário
      this.resetProductForm();

      return;

    }

    if (this.productForm.invalid) {
      return;
    }

    // Recuperamos o produto selecionado e o convertemos para um produto de venda
    // para que ele poder ser adicionado na listagem
    const selectedProduct = formData.product as Product;
    const saleProduct: SaleProduct = {
      name: selectedProduct.name,
      code: selectedProduct.code,
      barCode: selectedProduct.barCode,
      quantity: productQuantity,
      unit: selectedProduct.unit,
      value: selectedProduct.value,
      image: selectedProduct.image,
      categoryName: selectedProduct.categoryName
    };

    if (selectedProduct.unit === 'UNID' && !Number.isInteger(productQuantity)) {
      this.productForm.get('quantity').setErrors({integer: true});
      this.quantityInput.nativeElement.focus();
      return;
    }

    this.autocompleteProducts.next([]);
    this.newSaleService.addProduct(saleProduct);
    this.resetProductForm();

  }

  /**
   * Executado quando um produto é selecionado para determinar
   * o número de casas decimais que devem ser usadas no input de quantidade
   * @param event Evento emitido pelo autocomplete
   */
  productSelected(event: DcAutocompleteSelectedEvent) {

    const produto = event.option.value as Product;
    if (produto.unit === 'UNID') {
      this.decimalPlaces = 0;
    }

    // Foca o input de quantidade
    this.focusQuantity();

  }

  /**
   * Gerencia o pressionar da tecla ENTER no input de quantidade.
   * @param event Evento keydown emitido.
   */
  quantityEnter(event: KeyboardEvent) {

    if (!this.productForm.get('product').value) {
      event.preventDefault();
      this.productInput.nativeElement.focus();
    }

  }


  /**
   * Se o usuário pode deixar a página de nova venda sem nenhuma confirmação.
   */
  public canLeaveNewSale(): boolean {
    return this.newSaleService.canLeaveNewSale();
  }

  /**
   * Se o usuário pode deixar a página de editar venda/orçamento sem nenhuma confirmação.
   */
  public canLeaveSaleEdition(): boolean {
    return this.newSaleService.canLeaveSaleEdition();
  }

  /**
   * Função usada para retornar o nome do produto
   * no input do autocomplete.
   */
  displayProducts(product?: Product) {
    return product ? product.name : undefined;
  }

  ngOnDestroy() {

    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Função trackBy para a lista de produtos
   */
  productsTrackBy(index: number, item: Product) {
    return item.code;
  }

  /**
   * Atalho para focar o input de quantidade
   */
  @HostListener('document:keydown.F3', ['$event'])
  focusQuantity(event?: KeyboardEvent) {
    event?.preventDefault();

    if (!this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.quantityInput.nativeElement.focus();

  }

  /**
   * Adiciona um produto através da leitura do código de barras
   * @param codBarras Código de barras do produto.
   * @param quantity A quantidade informada pelo usuário
   */
  private addProductViaBarCode(codBarras: string, quantity?: number) {

    // Realiza a consulta do produto pelo código de barras
    this.productsService.getProductByBarCode(codBarras).pipe(takeUntil(this.unsub)).subscribe(product => {

      // Se a quantidade for informada, sobrescreve
      if (quantity) {
        product.quantity = quantity;
      }

      // Adiciona o produto
      this.newSaleService.addProduct(product);

    }, (error: HttpErrorResponse) => {

      if (error.status === 404) {

        // Produto não encontrado
        this.snackBar.dismiss();
        this.showProductNotFound();

        return;

      }

    });

  }

  /**
   * Exibe uma mensagem de confirmação quando um produto não foi encontrado
   * @private
   */
  private showProductNotFound(): void {

    const config: ConfirmationDlgConfig = new ConfirmationDlgConfig('Produto não encontrado',
      'Verifique o código de barras informado e tente novamente.',
      null, 'Fechar', null, false, true);

    this.dialog.open(ConfirmationDlgComponent, {data: config, maxWidth: '35%', autoFocus: false});

  }

  /**
   * Redefine o formulário de adicionar produto e foca o input do produto.
   */
  private resetProductForm() {
    this.productFormGroupDirective.resetForm();
    this.productForm.reset();
    this.productInput.nativeElement.focus();
    this.decimalPlaces = 3;
  }

  /**
   * Inicializa o autocomplete de produtos
   */
  private initProductsAutocomplete() {

    this.productForm.get('product').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      if (typeof value === 'string' && value.length >= 2) {

        // Se o valor informado for um código de barras, cancela a consulta
        if (BARCODE_REGEX.test(value)) {
          return;
        }

        this.productsService.loadProducts({
          name: value,
          sale: PRODUCT_SALE_TYPE.ONLY_AVAILABLE
        }).pipe(takeUntil(this.unsub)).subscribe((response) => {
          this.autocompleteProducts.next(response);
        });

      } else if (typeof value === 'string' && value.length === 0) {
        this.autocompleteProducts.next([]);
      }

    });

  }

}
