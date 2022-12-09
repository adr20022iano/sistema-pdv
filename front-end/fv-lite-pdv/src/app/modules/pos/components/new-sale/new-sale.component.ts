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

  /** Referência da lista de produtos */
  @ViewChild('saleProductsComponent', {static: true}) saleProductsComponent: SaleProductsComponent;

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

  /** O total dos produtos */
  productsTotal = new BehaviorSubject<number>(0);

  /** Se deve exibir a imagem do produto ou não */
  displayProductsImages: boolean;

  /** Se o sistema calcula estoque ou não */
  calculateStock: boolean;

  /** O número de casas decimais permitidas ao informar a quantidade de um produto */
  decimalPlaces = 3;

  /** Se a venda está bloqueada para edição */
  blockedSale = false;

  /** Se o usuário pode deletar uma venda */
  canDeleteSale: boolean;

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private productsService: ProductsService, private posService: PosService, private router: Router,
              private route: ActivatedRoute, private layoutService: LayoutService, private snackBar: DcSnackBar,
              private sideMenu: DcSideMenu, private dialog: DcDialog, private printService: PrintService,
              private authService: AuthService, private customersService: CustomersService, public newSaleService: NewSaleService) {

    // Verifica se deve bloquear edição da venda
    if (this.router.url.startsWith('/sales/view')) {
      this.blockedSale = true;
    }

  }

  /** Adiciona a classe que determina que a venda está bloqueada */
  @HostBinding('class.locked-sale') get lockedSale() {
    return this.blockedSale;
  }

  /** Se deve exibir ou não o botão de excluir venda */
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

    // Precisamos verificar se o produto está sendo adicionado, usando um objeto
    // ou o código de barras
    if (BARCODE_REGEX.test(formData.product)) {

      // Adicionar produto por código de barras
      this.addProductViaBarCode(formData.product);

      // Redefine o formulário
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
   * Executado quando um produto é selecionado para determinar
   * o número de casas decimais que devem ser usadas no input de quantidade
   * @param event Evento emitido pelo autocomplete
   */
  productSelected(event: DcAutocompleteSelectedEvent) {

    const produto = event.option.value as Product;
    if (produto.unit === 'UNID') {
      this.decimalPlaces = 0;
    }

  }

  /**
   * Abre a janela para informar o cliente e observação da venda.
   */
  @HostListener('document:keydown.F2')
  selectCustomer(): void {

    if (!this.canSave()) {
      return;
    }

    // Informamos a referência da instância do serviço para o sideMenu acessar os dados da venda
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
   * Abre a janela de confirmação para o usuário deletar uma venda
   */
  delete(): void {

    const title = this.newSaleService.editingQuote ? 'Excluir orçamento' : 'Excluir venda';

    const config = new ConfirmationDlgConfig(
      title,
      'Esta operação não poderá ser revertida.',
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
   * Redefine a página para seus valores padrões
   */
  resetPage() {

    // Habilita o formulário
    this.productForm.enable({emitEvent: false});

    // Redefine os dados da venda para poder realizar uma nova
    this.newSaleService.resetService();

    // Redefine o formulário de produto
    this.resetProductForm();

  }

  /**
   * Se o usuário pode deixar a página de nova venda sem nenhuma confirmação
   */
  public canLeaveNewSale(): boolean {
    return this.newSaleService.editingSale ? true : this.newSaleService.saleProducts.getValue().length === 0;
  }

  /**
   * Se o usuário pode deixar a página de editar venda sem nenhuma confirmação
   */
  public canLeaveSaleEdition(): boolean {
    return !this.newSaleService.unsavedChanges;
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

  productsTrackBy(index: number, item: Product) {
    return item.code;
  }

  /**
   * Atalho para focar o campo quantidade
   */
  @HostListener('document:keydown.F3', ['$event'])
  focusQuantity(event: KeyboardEvent) {
    event.preventDefault();

    // Usamos a verificação de um menu aberto aqui porque se um estiver aberto, não podemos focar o input no
    // background
    if (!this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.quantityInput.nativeElement.focus();

  }

  /**
   * Envia a requisição para deletar uma venda
   * @private
   */
  private deleteSale(): void {

    this.posService.deleteSale(this.newSaleService.saleBeingEditedCode).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.snackBar.open('Venda excluída com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
      this.router.navigate(['sales'], {
        queryParamsHandling: 'merge'
      }).then();

    });

  }

  /**
   * Envia a requisição para deletar um orçamento
   * @private
   */
  private deleteQuote(): void {

    this.posService.deleteQuote(this.newSaleService.saleBeingEditedCode).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.snackBar.open('Orçamento excluído com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
      this.router.navigate(['quotes'], {
        queryParamsHandling: 'merge'
      }).then();

    });

  }

  /**
   * Adiciona um produto através da leitura do código de barras
   * @param codBarras Código de barras do produto.
   */
  private addProductViaBarCode(codBarras: string) {

    // Realiza a consulta do produto pelo código de barras
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
   * Salva ou edita um orçamento
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
   * Salva uma nova venda ou a edição de uma
   */
  private saveNewSale(): void {

    // Recupera a venda para salvamento
    const newSaleData = this.newSaleService.getSaleForSaving();

    // Se está criando a nova venda a partir de um orçamento, informa o código do orçamento
    if (this.newSaleService.editingQuote) {
      newSaleData.quoteCode = this.newSaleService.saleBeingEditedCode;
    }

    // Envia a requisição para finalizar a venda
    this.posService.saveNewSale(newSaleData).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Gerencia a resposta da nova venda
      this.handleSavingNewResponse(response.code, false, this.newSaleService.editingQuote);

    }, () => {

      this.handleSavingError();

    });

  }

  /**
   * Salva a edição de uma venda
   * @private
   */
  private saveSaleEdition(): void {

    // Define os dados da venda que está sendo editada
    const saleEdition = this.newSaleService.getSaleForSaving();

    // Envia a requisição para finalizar a venda
    this.posService.saveSaleEdition(saleEdition).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.handleEditingResponse(false);

    }, () => {

      this.handleSavingError();

    });

  }

  /**
   * Salva um novo orçamento
   * @private
   */
  private saveNewQuote(): void {

    // Recupera o orçamento
    const quote = this.newSaleService.getSaleForSaving();

    // Envia a requisição para finalizar a venda
    this.posService.saveQuote(quote).pipe(takeUntil(this.unsub)).subscribe((response: any) => {

      this.handleSavingNewResponse(response.code, true);

    }, () => {

      this.handleSavingError();

    });

  }

  /**
   * Salva a edição de um orçamento
   * @private
   */
  private saveQuoteEdition(): void {

    // Recupera o orçamento
    const quote = this.newSaleService.getSaleForSaving();

    // Envia a requisição para finalizar a venda
    this.posService.saveQuoteEdition(quote).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.handleEditingResponse(true);

    }, () => {

      this.handleSavingError();

    });

  }

  /**
   * Gerencia a resposta de sucesso ao salvar uma venda ou orçamento.
   * @param saleOrQuoteCode O código da venda ou orçamento.
   * @param quote Se está gerenciando a resposta de sucesso de um orçamento ou venda.
   * @param originFromQuote Se a origem da nova venda é um orçamento.
   * @private
   */
  private handleSavingNewResponse(saleOrQuoteCode: number, quote: boolean, originFromQuote = false): void {

    // Redefine a página, exibe a mensagem de sucesso e imprime a venda/orçamento
    this.resetPage();

    // Liberamos a abertura de novos menus aqui para não acontecer de o usuário abrir algum menu durante o envio
    // da requisição de salvar a venda
    this.newSaleService.unlockOpeningInteractionMenus();

    // Exibe a mensagem ao usuário
    const message = quote ? 'Orçamento salvo com sucesso.' : 'Venda finalizada com sucesso.';
    this.snackBar.open(message, null, {duration: 1500, panelClass: 'sucesso'});

    // Navega de volta para a página de nova venda
    if (originFromQuote) {
      this.router.navigate(['/sales/new-sale']).then();
    }

  }

  /**
   * Gerencia a resposta após salvar a edição de uma venda ou orçamento.
   * @param quote Se é um orçamento ou venda que foi salvo.
   * @private
   */
  private handleEditingResponse(quote: boolean): void {

    // Redefine as verificações se pode sair da página de edição
    this.resetSaleEdition();

    // Venda atualizada com sucesso
    const message = quote ? 'Orçamento atualizado com sucesso.' : 'Venda atualizada com sucesso.';
    this.snackBar.open(message, null, {duration: 3500, panelClass: 'sucesso'});

    // Navega para a página de vendas
    const finalRoute = quote ? 'quotes' : 'sales';
    this.router.navigate([finalRoute], {
      queryParamsHandling: 'merge'
    }).then();

  }

  /**
   * Gerencia a resposta de erro ao salvar uma venda, orçamento ou edição da venda
   * @private
   */
  private handleSavingError(): void {

    // Desbloqueia a interação dos menus
    this.newSaleService.unlockOpeningInteractionMenus();

    // Habilita o formulário
    this.productForm.enable();

  }

  /**
   * Realiza as verificações e retorna se pode salvar uma venda/orçamento.
   * Se pode salvar, também bloqueia a abertura dos menus de interação e desabilita o formulário de produtos.
   * @private
   */
  private canSave(): boolean {

    // Verifica se não existe nenhum menu aberto
    if (this.blockedSale || !this.newSaleService.canOpenInteractionMenu()) {
      return false;
    }

    // Verificamos se a venda possui produtos
    if (this.newSaleService.saleProducts.getValue().length === 0) {

      this.snackBar.open('Não é possível finalizar uma venda sem produtos.', null, {
        duration: 2000,
        panelClass: 'falha'
      });

      return false;

    }

    // Bloqueia a abertura de outros menus
    this.newSaleService.blockOpeningInteractionMenus();

    // Desabilita o formulário de produto
    this.productForm.disable();

    return true;

  }

  /**
   * Redefine o formulário de adicionar produto e foca o input do produto.
   */
  private resetProductForm() {
    this.productFormGroupDirective.resetForm();
    this.productForm.reset();
    this.decimalPlaces = 3;
  }

  /**
   * Verifica se uma venda está sendo editada ou uma nova venda foi iniciada ao iniciar o componente.
   */
  private checkEditingOrNewSale(): void {

    // Recupera o código da venda/orçamento, se ele existir
    const editionCode = this.route.snapshot.paramMap.get('saleCode');

    // Se estamos editando uma venda, carregamos ela, se não verificamos se um cliente foi
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

      // Carrega a venda no serviço de edição
      this.newSaleService.setSaleForEdition(response);

    }, () => {

      // Navega para a página das vendas
      this.router.navigate(['sales']).then();

    });

  }

  /**
   * Carrega a consulta dos dados do orçamento define o estado dos componentes.
   * @private
   */
  private loadQuote(quoteCode: number): void {

    this.posService.setFocusTarget(quoteCode);
    this.posService.getQuote(quoteCode).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Carrega o orçamento no serviço de edição
      this.newSaleService.setSaleForEdition(response, true);

    }, () => {

      // Navega para a página das vendas
      this.router.navigate(['quotes']).then();

    });

  }

  /**
   * Inicializa o autocomplete de produtos e clientes
   */
  private initAutocompletes() {

    this.productForm.get('product').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      if (typeof value === 'string' && value.length >= 2) {

        // Se o valor informado for um código de barras, cancela a consulta
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
   * Redefine o status de alteração da venda que está sendo editada, para poder deixar
   * a página.
   */
  private resetSaleEdition() {
    this.newSaleService.unsavedChanges = false;
  }

  /**
   * Carrega as configurações do sistema para uso de fotos e cálculo de estoque
   * @private
   */
  private loadSystemConfiguration(): void {

    const userConfig = this.authService.getUserConfig();
    this.displayProductsImages = userConfig?.useProductImage;
    this.canDeleteSale = userConfig?.sellerDeleteSale;
    this.calculateStock = userConfig?.calculateStock;

  }

}
