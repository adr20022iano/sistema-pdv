import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {DcInput} from '@devap-br/devap-components/input';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {Product} from 'src/app/modules/products/models/product';
import {ProductsService} from 'src/app/modules/products/services/products.service';
import {SaleProduct} from '../../models/sale-product';
import {PosService} from '../../services/pos.service';
import {SaleExtrasComponent} from './sale-extras/sale-extras.component';
import {PrintService} from '../../../core/services/print.service';
import {AuthService} from '../../../core/services/auth.service';
import {DcAutocompleteSelectedEvent} from '@devap-br/devap-components';
import {CustomersService} from '../../../customers/services/customers.service';
import {ConfirmationDlgConfig} from '../../../shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from '../../../shared/components/confirmation-dlg/confirmation-dlg.component';
import {NewSaleService} from '../../services/new-sale.service';
import {SaleProductsComponent} from './sale-products/sale-products.component';
import {CustomValidators} from '../../../shared/validators/custom-validators';

const BARCODE_REGEX = /^\d{8,14}$/;

@Component({
  selector: 'lpdv-fv-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss'],
  providers: [{provide: NewSaleService, useClass: NewSaleService}],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewSaleComponent implements OnInit, OnDestroy {

  /** Lista dos produtos do autocomplete */
  autocompleteProducts = new BehaviorSubject<Product[]>([]);

  /** Refer??ncia da lista de produtos */
  @ViewChild('saleProductsComponent', {static: true}) saleProductsComponent: SaleProductsComponent;

  /** Formul??rio para adicionar um novo produto ?? venda */
  productForm = new FormGroup({
    product: new FormControl('', CustomValidators.objectKeyValidator('code', true)),
    quantity: new FormControl(),
  });

  /** Input do autocomplete de produtos. */
  @ViewChild('productInput') productInput: ElementRef<DcInput>;

  /** FormGroupDirective do formul??rio de produtos. */
  @ViewChild(FormGroupDirective) productFormGroupDirective: FormGroupDirective;

  /** Input de quantidade */
  @ViewChild('quantityInput') quantityInput: ElementRef<DcInput>;

  /** O total dos produtos */
  productsTotal = new BehaviorSubject<number>(0);

  /** Se deve exibir a imagem do produto ou n??o */
  displayProductsImages: boolean;

  /** Se o sistema calcula estoque ou n??o */
  calculateStock: boolean;

  /** O n??mero de casas decimais permitidas ao informar a quantidade de um produto */
  decimalPlaces = 3;

  /** Se a venda est?? bloqueada para edi????o */
  blockedSale = false;

  /** Se o usu??rio pode deletar uma venda */
  canDeleteSale: boolean;

  /** Gerencia as inscri????es */
  private unsub: Subject<any> = new Subject();

  constructor(private productsService: ProductsService, private posService: PosService, private router: Router,
              private route: ActivatedRoute, private layoutService: LayoutService, private snackBar: DcSnackBar,
              private sideMenu: DcSideMenu, private dialog: DcDialog, private printService: PrintService,
              private authService: AuthService, private customersService: CustomersService, public newSaleService: NewSaleService) {

    // Verifica se deve bloquear edi????o da venda
    if (this.router.url.startsWith('/sales/view')) {
      this.blockedSale = true;
    }

  }

  /** Adiciona a classe que determina que a venda est?? bloqueada */
  @HostBinding('class.locked-sale') get lockedSale() {
    return this.blockedSale;
  }

  /** Se deve exibir ou n??o o bot??o de excluir venda */
  get showDeleteSaleButton(): boolean {
    return this.newSaleService.editingQuote || (this.newSaleService.editingSale && this.canDeleteSale && !this.blockedSale);
  }

  ngOnInit(): void {

    this.loadSystemConfiguration();
    this.initAutocompletes();
    this.checkEditingOrNewSale();

  }

  /**
   * Adiciona um produto na venda.
   */
  addProduct() {

    const formData = this.productForm.getRawValue();
    const productQuantity = formData.quantity || 1;

    // Precisamos verificar se o produto est?? sendo adicionado, usando um objeto
    // ou o c??digo de barras
    if (BARCODE_REGEX.test(formData.product)) {

      // Adicionar produto por c??digo de barras
      this.addProductViaBarCode(formData.product);

      // Redefine o formul??rio
      this.resetProductForm();

      return;

    }

    if (this.productForm.invalid) {
      return;
    }

    // Recuperamos o produto selecionado e o convertemos para um produto de venda
    // para que ele possa ser adicionado na listagem
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
   * Executado quando um produto ?? selecionado para determinar
   * o n??mero de casas decimais que devem ser usadas no input de quantidade
   * @param event Evento emitido pelo autocomplete
   */
  productSelected(event: DcAutocompleteSelectedEvent) {

    const produto = event.option.value as Product;
    if (produto.unit === 'UNID') {
      this.decimalPlaces = 0;
    }

  }

  /**
   * Abre a janela para informar o cliente e observa????o da venda.
   */
  @HostListener('document:keydown.F2')
  selectCustomer(): void {

    if (!this.canSave()) {
      return;
    }

    // Informamos a refer??ncia da inst??ncia do servi??o para o sideMenu acessar os dados da venda
    this.sideMenu.open(SaleExtrasComponent, {
      data: this.newSaleService,
      autoFocus: false
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: number) => {

      // Libera a abertura de outros menus usando atalhos do teclado
      this.newSaleService.unlockOpeningInteractionMenus();

      switch (result) {

        case 1:
          this.saveSale();
          break;

        case 2:
          this.saveQuote();
          break;

      }

    });

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
   * Abre a janela de confirma????o para o usu??rio deletar uma venda
   */
  delete(): void {

    const title = this.newSaleService.editingQuote ? 'Excluir or??amento' : 'Excluir venda';

    const config = new ConfirmationDlgConfig(
      title,
      'Esta opera????o n??o poder?? ser revertida.',
      undefined, 'Excluir',
      'Cancelar'
    );

    this.dialog.open(ConfirmationDlgComponent, {
      data: config,
      autoFocus: true,
      minWidth: '35%'
    }).afterClosed().subscribe(result => {

      if (result) {
        this.newSaleService.editingQuote ? this.deleteQuote() : this.deleteSale();
      }

    });

  }

  /**
   * Redefine a p??gina para seus valores padr??es
   */
  resetPage() {

    // Habilita o formul??rio
    this.productForm.enable({emitEvent: false});

    // Redefine os dados da venda para poder realizar uma nova
    this.newSaleService.resetService();

    // Redefine o formul??rio de produto
    this.resetProductForm();

  }

  /**
   * Se o usu??rio pode deixar a p??gina de nova venda sem nenhuma confirma????o
   */
  public canLeaveNewSale(): boolean {
    return this.newSaleService.editingSale ? true : this.newSaleService.saleProducts.getValue().length === 0;
  }

  /**
   * Se o usu??rio pode deixar a p??gina de editar venda sem nenhuma confirma????o
   */
  public canLeaveSaleEdition(): boolean {
    return !this.newSaleService.unsavedChanges;
  }

  /**
   * Fun????o usada para retornar o nome do produto
   * no input do autocomplete.
   */
  displayProducts(product?: Product) {
    return product ? product.name : undefined;
  }

  ngOnDestroy() {

    this.unsub.next();
    this.unsub.complete();

  }

  productsTrackBy(index: number, item: Product) {
    return item.code;
  }

  /**
   * Atalho para focar o campo quantidade
   */
  @HostListener('document:keydown.F3', ['$event'])
  focusQuantity(event: KeyboardEvent) {
    event.preventDefault();

    // Usamos a verifica????o de um menu aberto aqui porque se um estiver aberto, n??o podemos focar o input no
    // background
    if (!this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.quantityInput.nativeElement.focus();

  }

  /**
   * Envia a requisi????o para deletar uma venda
   * @private
   */
  private deleteSale(): void {

    this.posService.deleteSale(this.newSaleService.saleBeingEditedCode).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.snackBar.open('Venda exclu??da com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
      this.router.navigate(['sales'], {
        queryParamsHandling: 'merge'
      }).then();

    });

  }

  /**
   * Envia a requisi????o para deletar um or??amento
   * @private
   */
  private deleteQuote(): void {

    this.posService.deleteQuote(this.newSaleService.saleBeingEditedCode).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.snackBar.open('Or??amento exclu??do com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
      this.router.navigate(['quotes'], {
        queryParamsHandling: 'merge'
      }).then();

    });

  }

  /**
   * Adiciona um produto atrav??s da leitura do c??digo de barras
   * @param codBarras C??digo de barras do produto.
   */
  private addProductViaBarCode(codBarras: string) {

    // Realiza a consulta do produto pelo c??digo de barras
    this.productsService.getProductByBarCode(codBarras).pipe(takeUntil(this.unsub)).subscribe(produto => {

      // Adiciona o produto
      this.newSaleService.addProduct(produto);

    });

  }

  /**
   * Salva ou edita uma venda normal.
   */
  private saveSale(): void {

    if (!this.newSaleService.editingQuote && this.newSaleService.editingSale) {
      this.saveSaleEdition();
    } else {
      this.saveNewSale();
    }

  }

  /**
   * Salva ou edita um or??amento
   * @private
   */
  private saveQuote(): void {

    if (this.newSaleService.editingQuote) {
      this.saveQuoteEdition();
    } else {
      this.saveNewQuote();
    }

  }

  /**
   * Salva uma nova venda ou a edi????o de uma
   */
  private saveNewSale(): void {

    // Recupera a venda para salvamento
    const newSaleData = this.newSaleService.getSaleForSaving();

    // Se est?? criando a nova venda a partir de um or??amento, informa o c??digo do or??amento
    if (this.newSaleService.editingQuote) {
      newSaleData.quoteCode = this.newSaleService.saleBeingEditedCode;
    }

    // Envia a requisi????o para finalizar a venda
    this.posService.saveNewSale(newSaleData).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Gerencia a resposta da nova venda
      this.handleSavingNewResponse(response.code, false, this.newSaleService.editingQuote);

    }, () => {

      this.handleSavingError();

    });

  }

  /**
   * Salva a edi????o de uma venda
   * @private
   */
  private saveSaleEdition(): void {

    // Define os dados da venda que est?? sendo editada
    const saleEdition = this.newSaleService.getSaleForSaving();

    // Envia a requisi????o para finalizar a venda
    this.posService.saveSaleEdition(saleEdition).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.handleEditingResponse(false);

    }, () => {

      this.handleSavingError();

    });

  }

  /**
   * Salva um novo or??amento
   * @private
   */
  private saveNewQuote(): void {

    // Recupera o or??amento
    const quote = this.newSaleService.getSaleForSaving();

    // Envia a requisi????o para finalizar a venda
    this.posService.saveQuote(quote).pipe(takeUntil(this.unsub)).subscribe((response: any) => {

      this.handleSavingNewResponse(response.code, true);

    }, () => {

      this.handleSavingError();

    });

  }

  /**
   * Salva a edi????o de um or??amento
   * @private
   */
  private saveQuoteEdition(): void {

    // Recupera o or??amento
    const quote = this.newSaleService.getSaleForSaving();

    // Envia a requisi????o para finalizar a venda
    this.posService.saveQuoteEdition(quote).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.handleEditingResponse(true);

    }, () => {

      this.handleSavingError();

    });

  }

  /**
   * Gerencia a resposta de sucesso ao salvar uma venda ou or??amento.
   * @param saleOrQuoteCode O c??digo da venda ou or??amento.
   * @param quote Se est?? gerenciando a resposta de sucesso de um or??amento ou venda.
   * @param originFromQuote Se a origem da nova venda ?? um or??amento.
   * @private
   */
  private handleSavingNewResponse(saleOrQuoteCode: number, quote: boolean, originFromQuote = false): void {

    // Redefine a p??gina, exibe a mensagem de sucesso e imprime a venda/or??amento
    this.resetPage();

    // Liberamos a abertura de novos menus aqui para n??o acontecer de o usu??rio abrir algum menu durante o envio
    // da requisi????o de salvar a venda
    this.newSaleService.unlockOpeningInteractionMenus();

    // Exibe a mensagem ao usu??rio
    const message = quote ? 'Or??amento salvo com sucesso.' : 'Venda finalizada com sucesso.';
    this.snackBar.open(message, null, {duration: 1500, panelClass: 'sucesso'});

    // Navega de volta para a p??gina de nova venda
    if (originFromQuote) {
      this.router.navigate(['/sales/new-sale']).then();
    }

  }

  /**
   * Gerencia a resposta ap??s salvar a edi????o de uma venda ou or??amento.
   * @param quote Se ?? um or??amento ou venda que foi salvo.
   * @private
   */
  private handleEditingResponse(quote: boolean): void {

    // Redefine as verifica????es se pode sair da p??gina de edi????o
    this.resetSaleEdition();

    // Venda atualizada com sucesso
    const message = quote ? 'Or??amento atualizado com sucesso.' : 'Venda atualizada com sucesso.';
    this.snackBar.open(message, null, {duration: 3500, panelClass: 'sucesso'});

    // Navega para a p??gina de vendas
    const finalRoute = quote ? 'quotes' : 'sales';
    this.router.navigate([finalRoute], {
      queryParamsHandling: 'merge'
    }).then();

  }

  /**
   * Gerencia a resposta de erro ao salvar uma venda, or??amento ou edi????o da venda
   * @private
   */
  private handleSavingError(): void {

    // Desbloqueia a intera????o dos menus
    this.newSaleService.unlockOpeningInteractionMenus();

    // Habilita o formul??rio
    this.productForm.enable();

  }

  /**
   * Realiza as verifica????es e retorna se pode salvar uma venda/or??amento.
   * Se pode salvar, tamb??m bloqueia a abertura dos menus de intera????o e desabilita o formul??rio de produtos.
   * @private
   */
  private canSave(): boolean {

    // Verifica se n??o existe nenhum menu aberto
    if (this.blockedSale || !this.newSaleService.canOpenInteractionMenu()) {
      return false;
    }

    // Verificamos se a venda possui produtos
    if (this.newSaleService.saleProducts.getValue().length === 0) {

      this.snackBar.open('N??o ?? poss??vel finalizar uma venda sem produtos.', null, {
        duration: 2000,
        panelClass: 'falha'
      });

      return false;

    }

    // Bloqueia a abertura de outros menus
    this.newSaleService.blockOpeningInteractionMenus();

    // Desabilita o formul??rio de produto
    this.productForm.disable();

    return true;

  }

  /**
   * Redefine o formul??rio de adicionar produto e foca o input do produto.
   */
  private resetProductForm() {
    this.productFormGroupDirective.resetForm();
    this.productForm.reset();
    this.decimalPlaces = 3;
  }

  /**
   * Verifica se uma venda est?? sendo editada ou uma nova venda foi iniciada ao iniciar o componente.
   */
  private checkEditingOrNewSale(): void {

    // Recupera o c??digo da venda/or??amento, se ele existir
    const editionCode = this.route.snapshot.paramMap.get('saleCode');

    // Se estamos editando uma venda, carregamos ela, se n??o verificamos se um cliente foi
    // selecionado para a nova venda
    if (editionCode !== null) {

      const editingQuote = this.router.url.startsWith('/quotes');
      if (editingQuote) {
        this.loadQuote(+editionCode);
      } else {
        this.loadSale(+editionCode);
      }

    } else {
      this.checkCustomerForNewSale();
    }

  }

  /**
   * Verifica se um cliente foi selecionado para iniciar a nova venda,
   * se sim o carrega como o cliente da venda.
   * @private
   */
  private checkCustomerForNewSale(): void {

    const selectedCustomer = this.customersService.getNewSaleCustomer();
    if (selectedCustomer) {
      this.newSaleService.setSaleCustomer(selectedCustomer);
    }

  }

  /**
   * Realiza a consulta dos dados da venda define o estado dos componentes.
   */
  private loadSale(saleCode: number) {

    this.saleProductsComponent.setStatus('carregando');
    this.posService.setFocusTarget(saleCode);
    this.posService.getSale(saleCode).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Carrega a venda no servi??o de edi????o
      this.newSaleService.setSaleForEdition(response);

    }, () => {

      // Navega para a p??gina das vendas
      this.router.navigate(['sales']).then();

    });

  }

  /**
   * Carrega a consulta dos dados do or??amento define o estado dos componentes.
   * @private
   */
  private loadQuote(quoteCode: number): void {

    this.posService.setFocusTarget(quoteCode);
    this.posService.getQuote(quoteCode).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Carrega o or??amento no servi??o de edi????o
      this.newSaleService.setSaleForEdition(response, true);

    }, () => {

      // Navega para a p??gina das vendas
      this.router.navigate(['quotes']).then();

    });

  }

  /**
   * Inicializa o autocomplete de produtos e clientes
   */
  private initAutocompletes() {

    this.productForm.get('product').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      if (typeof value === 'string' && value.length >= 2) {

        // Se o valor informado for um c??digo de barras, cancela a consulta
        if (BARCODE_REGEX.test(value)) {
          return;
        }

        this.productsService.loadProducts({
          name: value,
        }).pipe(takeUntil(this.unsub)).subscribe((response) => {
          this.autocompleteProducts.next(response);
        });

      } else if (typeof value === 'string' && value.length === 0) {
        this.autocompleteProducts.next([]);
      }

    });

  }

  /**
   * Redefine o status de altera????o da venda que est?? sendo editada, para poder deixar
   * a p??gina.
   */
  private resetSaleEdition() {
    this.newSaleService.unsavedChanges = false;
  }

  /**
   * Carrega as configura????es do sistema para uso de fotos e c??lculo de estoque
   * @private
   */
  private loadSystemConfiguration(): void {

    const userConfig = this.authService.getUserConfig();
    this.displayProductsImages = userConfig?.useProductImage;
    this.canDeleteSale = userConfig?.sellerDeleteSale;
    this.calculateStock = userConfig?.calculateStock;

  }

}
