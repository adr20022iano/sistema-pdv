import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {PosService} from './pos.service';
import {SaleProduct} from '../models/sale-product';
import {map, takeUntil} from 'rxjs/operators';
import {Customer} from '../../customers/models/customer';
import Big from 'big.js';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {ActivatedRoute, Router} from '@angular/router';
import {CustomersService} from '../../customers/services/customers.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {NewSale} from '../models/new-sale';
import {AuthService} from '../../core/services/auth.service';
import {Seller} from '../../sellers/models/seller';
import {NewSalePaymentsValues} from '../models/new-sale-payments';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {NewSalePaymentComponent} from '../components/new-sale/new-sale-payment/new-sale-payment.component';
import {RECEIPT_TYPE} from '../../settings/models/receipt-type.enum';
import {CouponType, SaleCouponHelper} from '../helpers/sale-coupon-helper';
import {SaleReceiptHelper} from '../helpers/sale-receipt-helper';
import {LogoService} from '../../shared/services/logo.service';
// import {SaleReceiptHelper} from '../helpers/sale-receipt-helper';

/**
 * O tipo da operação de venda do que o serviço está gerenciando.
 */
export type SaleType = 'new-sale' | 'edit-sale' | 'edit-quote';

/**
 * Serviço que controla os dados de uma nova venda.
 */
@Injectable()
export class NewSaleService implements OnDestroy {

  /** Se existem alterações não salvas na venda */
  private unsavedChanges = false;

  /** Se algum menu de interação está aberto */
  private interactionMenuOpened = false;

  /** O último produto que foi removido da venda */
  private lastRemovedProduct: { productIndex: number, product: SaleProduct };

  /** Os valores de pagamento informados */
  private salePayments: NewSalePaymentsValues;

  /** A lista dos produtos da venda */
  private readonly saleProducts = new BehaviorSubject<SaleProduct[]>([]);

  /** Subtotal dos produtos da venda */
  private readonly saleProductsSubtotal = new BehaviorSubject<number>(0);

  /** O valor total da venda */
  private readonly saleTotal = new BehaviorSubject<number>(0);

  /** O valor de frete da venda */
  private readonly saleShippingValue = new BehaviorSubject<number>(0);

  /** Se a nova venda é para entrega ou não */
  private readonly saleDelivery = new BehaviorSubject<boolean>(false);

  /** O valor de desconto da venda */
  private readonly saleDiscountValue = new BehaviorSubject<number>(0);

  /** A observação da venda */
  private readonly saleObservation = new BehaviorSubject('');

  /** O cliente da venda */
  private readonly saleCustomer = new BehaviorSubject<Customer>(undefined);

  /** O vendedor selecionado */
  private readonly saleSeller = new BehaviorSubject<Seller>(undefined);

  /** O status da lista de produtos */
  private readonly productsStatus = new BehaviorSubject<LoaderStatus>('vazio');

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  /** Emite um evento quando o serviço é redefinido */
  private readonly serviceReset = new Subject<void>();

  /** O tipo da operação atual do serviço */
  private readonly saleServiceType: BehaviorSubject<SaleType>;

  /** O código da venda ou orçamento carregado atualmente no serviço, undefined se for uma nova venda */
  private readonly saleCode: number | undefined;

  /** Se o usuário atual é um administrador */
  private readonly isAdmin: boolean;

  /** Se já está salvando uma venda/orçamento ou não */
  private readonly isSaving = new BehaviorSubject(false);

  /** Se o cliente é obrigatório para finalizar uma venda */
  private readonly requiredCustomer: boolean;

  /** Se o vendedor é obrigatório para finalizar uma venda */
  private readonly requiredSeller: boolean;

  /** O número de cópias que deve sem impresso após finalizar uma nova venda */
  private readonly postSalePrintCopies: number;

  constructor(private posService: PosService, private customerService: CustomersService, private router: Router,
              private acRoute: ActivatedRoute, private snackBar: DcSnackBar, private authService: AuthService,
              private sideMenu: DcSideMenu, private logoService: LogoService) {

    this.registerValuesWatcher();
    this.registerProductsStatusWatcher();

    // Recupera se o usuário é um administrador
    this.isAdmin = this.authService.isAdmin();

    // Se é obrigatório informar um cliente/vendedor
    const userConfig = this.authService.getUserConfig();
    this.requiredCustomer = userConfig?.requiredCustomerOnSale;
    this.requiredSeller = userConfig?.requiredSeller === 2;
    this.postSalePrintCopies = userConfig?.postSalePrintPagesNumber;

    // Recupera o código da venda
    this.saleCode = this.getRouteSaleCode();

    // Define o tipo da operação que o serviço está gerenciando
    this.saleServiceType = new BehaviorSubject<SaleType>(this.getRouteSaleType(this.saleCode));

    // Se necessário, carrega a venda ou orçamento
    if (this.saleCode) {
      this.loadSaleForEdition(this.saleCode);
    }

  }

  ngOnDestroy() {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();
    this.serviceReset.complete();

  }

  /**
   * Adiciona um produto no início da lista de produtos, ou atualiza
   * sua quantidade se ele já existir na lista.
   * @param product O produto que será adicionado na venda.
   */
  public addProduct(product: SaleProduct): void {

    const currentProducts = this.saleProducts.getValue();
    const index = currentProducts.findIndex(saleProduct => saleProduct.code === product.code);

    // Verificamos se devemos atualizar o produto ou adicionar um novo
    if (index > -1) {

      // Se estamos atualizando o produto, durante o processo de adicionar,
      // atualizamos somente a quantidade, e deixamos o valor como está.
      this.updateProduct(index, currentProducts[index].quantity + product.quantity, undefined);

    } else {
      this.saleProducts.next([product, ...currentProducts]);
    }

    // Define que foram realizas alterações não salvas na venda
    this.unsavedChanges = true;

  }

  /**
   * Atualiza um produto na venda.
   * @param productIndex Index do produto que será atualizado.
   * @param newQuantity A nova quantidade do produto.
   * @param newValue O novo valor do produto (Se não informado, mantém o valor atual).
   * @param observation A nova observação do produto.
   */
  public updateProduct(productIndex: number, newQuantity: number, newValue?: number, observation?: string) {

    // Para realizarmos a atualização de um produto
    // recuperamos a lista atual, encontramos o item usando seu index
    // copiamos o produto para um novo objeto
    // atualizamos as variáveis de quantidade, e opcionalmente, valor,
    // e substituímos o item dentro do array.
    const currentProducts = this.saleProducts.getValue();
    const productToUpdate = currentProducts[productIndex];
    const updatedProduct = Object.assign({}, productToUpdate);
    updatedProduct.quantity = newQuantity;
    if (newValue) {
      updatedProduct.value = newValue;
    }
    currentProducts.splice(productIndex, 1, updatedProduct);
    this.saleProducts.next(currentProducts);
    this.unsavedChanges = true;

  }

  /**
   * Remove um produto da venda.
   * @param productIndex Index do produto que será removido.
   * @param product O produto que será removido da venda.
   */
  public removeProduct(productIndex: number, product: SaleProduct) {

    // Para remover um produto, consultamos a lista atual,
    // e o removemos do array usando seu index. Emitimos a nova lista de produtos,
    // o evento de remoção e armazenamos o produto que foi removido para que
    // o usuário possa desfazer a remoção
    const currentProducts = this.saleProducts.getValue();
    currentProducts.splice(productIndex, 1);
    this.saleProducts.next(currentProducts);
    this.lastRemovedProduct = {productIndex, product};

    // Define que foram realizas alterações não salvas na venda
    this.unsavedChanges = true;

  }

  /**
   * Desfaz a remoção do último produto que foi removido da venda.
   */
  public undoLastRemoval() {

    if (this.lastRemovedProduct) {

      const index = this.lastRemovedProduct.productIndex;
      const product = this.lastRemovedProduct.product;
      let saleProducts = this.saleProducts.getValue();

      // Para podermos adicionar um item na sua posição anterior, dividimos os itens
      // em dois arrays diferentes, os que estão antes e a partir da sua posição,
      // então usamos o spread operator para montar um novo array
      // com o item que foi removido no seu índice correto.
      saleProducts = [...saleProducts.slice(0, index), product, ...saleProducts.slice(index)];
      this.saleProducts.next(saleProducts);
      this.lastRemovedProduct = undefined;

    }

  }

  /**
   * Retorna se pode abrir um menu de interação.
   * @private
   */
  public canOpenInteractionMenu(): boolean {
    return !this.interactionMenuOpened;
  }

  /**
   * Bloqueia a abertura de menus de interação.
   * @private
   */
  public blockOpeningInteractionMenus(): void {
    this.interactionMenuOpened = true;
  }

  /**
   * Libera a abertura de menus de interação.
   * @private
   */
  public unlockOpeningInteractionMenus(): void {
    this.interactionMenuOpened = false;
  }

  /**
   * Define o cliente da venda.
   * @param customer O cliente selecionado para a venda.
   */
  public setSaleCustomer(customer: Customer): void {
    this.saleCustomer.next(customer);
    this.unsavedChanges = true;
  }

  /**
   * Remove o cliente da venda.
   */
  public removeCustomer(): void {
    this.saleCustomer.next(undefined);
    this.unsavedChanges = true;
  }

  /**
   * Define o vendedor da venda.
   * @param seller O vendedor que foi selecionado.
   */
  public setSaleSeller(seller: Seller): void {
    this.saleSeller.next(seller);
    this.unsavedChanges = true;
  }

  /**
   * Remove o vendedor selecionado para a venda.
   */
  public removeSeller(): void {
    this.saleSeller.next(undefined);
    this.unsavedChanges = true;
  }

  /**
   * Define o valor de frete da venda.
   * @param shippingValue O valor do frete.
   */
  public setSaleShippingValue(shippingValue: number): void {
    this.saleShippingValue.next(shippingValue);
    this.unsavedChanges = true;
  }

  /**
   * Alterna o parâmetro de entrega da venda
   */
  public toggleDelivery(): void {
    const isDelivery = this.saleDelivery.getValue();
    this.saleDelivery.next(!isDelivery);
    this.unsavedChanges = true;
  }

  /**
   * Retorna um observable que emite quando o parâmetro de entrega é alterado.
   */
  public delivery(): Observable<boolean> {
    return this.saleDelivery.asObservable();
  }

  /**
   * Define o valor de desconto da venda.
   * @param discountValue O valor do desconto.
   */
  public setSaleDiscountValue(discountValue: number): void {
    this.saleDiscountValue.next(discountValue);
    this.unsavedChanges = true;
  }

  /**
   * Define a observação de uma venda.
   * @param saleObservation A observação da venda.
   */
  public setSaleObservation(saleObservation: string): void {
    this.saleObservation.next(saleObservation);
    this.unsavedChanges = true;
  }

  /**
   * Salva a venda/orçamento.
   * @param quote Se deve salvar como um orçamento.
   */
  public save(quote: boolean): void {

    if (!this.canSave()) {
      return;
    }

    if (quote) {
      this.saveQuote();
    } else {
      if (this.saleCode) {
        this.blockOpeningInteractionMenus();
        this.saveSale();
      } else {
        this.openSalePaymentValues();
      }
    }

  }

  /**
   * Redefine o serviço de venda para o estado de uma nova venda e libera a abertura dos menus de interação.
   */
  public resetSale(): void {

    this.isSaving.next(false);
    this.saleProducts.next([]);
    this.saleShippingValue.next(0);
    this.saleDiscountValue.next(0);
    this.saleObservation.next(undefined);
    this.saleCustomer.next(undefined);
    this.saleSeller.next(undefined);
    this.saleDelivery.next(false);
    this.unsavedChanges = false;
    this.lastRemovedProduct = undefined;
    this.salePayments = undefined;
    this.unlockOpeningInteractionMenus();
    this.serviceReset.next();

  }

  /**
   * Carrega uma venda ou orçamento para edição.
   */
  public loadSaleForEdition(saleCode: number): void {

    // Marca como está carregando os produtos
    this.productsStatus.next('carregando');
    this.posService.setFocusTarget(saleCode);

    // Verifica se deve carregar uma venda ou orçamento
    this.posService.loadSaleForEdition(saleCode, this.getCurrentSaleType() === 'edit-quote').pipe(takeUntil(this.unsub)).subscribe(sale => {

      this.saleProducts.next(sale.products);
      this.saleShippingValue.next(sale.shipping);
      this.saleDiscountValue.next(sale.discount);
      this.saleObservation.next(sale.observation);
      this.saleCustomer.next(sale.customer);
      this.saleSeller.next(sale.seller);

    }, () => this.navigateToParent(false));

  }

  /**
   * Retorna um observable da lista de produtos
   */
  public products(): Observable<SaleProduct[]> {
    return this.saleProducts.asObservable();
  }

  /**
   * Retorna um observable do subtotal dos produtos.
   */
  public productsSubtotal(): Observable<number> {
    return this.saleProductsSubtotal.asObservable();
  }

  /**
   * Retorna o subtotal atual dos produtos.
   */
  public getProductsSubtotal(): number {
    return this.saleProductsSubtotal.getValue();
  }

  /**
   * Retorna um observable do total da venda.
   */
  public total(): Observable<number> {
    return this.saleTotal.asObservable();
  }

  /**
   * Retorna o número de produtos na venda.
   */
  public getNumberOfProducts(): number {
    return this.saleProducts.getValue().length;
  }

  /**
   * Retorna o total da venda.
   */
  public getTotal(): number {
    return this.saleTotal.getValue();
  }

  /**
   * Retorna o valor da venda sem o desconto informado.
   */
  public getSaleValueWithoutDiscount(): number {
    return new Big(this.saleProductsSubtotal.getValue()).add(new Big(this.saleShippingValue.getValue())).toNumber();
  }

  /**
   * Retorna um observable do valor de frete da venda.
   */
  public shipping(): Observable<number> {
    return this.saleShippingValue.asObservable();
  }

  /**
   * Retorna o valor de frete da venda.
   */
  public getShipping(): number {
    return this.saleShippingValue.getValue();
  }

  /**
   * Retorna um observable do valor de desconto da venda em R$.
   */
  public discount(): Observable<number> {
    return this.saleDiscountValue.asObservable();
  }

  /**
   * Retorna o desconto da venda em R$.
   */
  public getDiscount(): number {
    return this.saleDiscountValue.getValue();
  }

  /**
   * Retorna um observable do cliente da venda.
   */
  public customer(): Observable<Customer> {
    return this.saleCustomer.asObservable();
  }

  /**
   * Retorna o cliente da venda.
   */
  public getSaleCustomer(): Customer {
    return this.saleCustomer.getValue();
  }

  /**
   * Retorna um observable do vendedor selecionado para a venda.
   */
  public seller(): Observable<Seller> {
    return this.saleSeller.asObservable();
  }

  /**
   * Retorna o vendedor da venda.
   */
  public getSeller(): Seller {
    return this.saleSeller.getValue();
  }

  /**
   * Retorna um observable da observação da venda.
   */
  public observation(): Observable<string> {
    return this.saleObservation.asObservable();
  }

  /**
   * Retorna a observação da venda.
   */
  public getObservation(): string {
    return this.saleObservation.getValue();
  }

  /**
   * Retorna um observable do status da lista de produtos.
   */
  public productsListStatus(): Observable<LoaderStatus> {
    return this.productsStatus.asObservable();
  }

  /**
   * Retorna o tipo da operação do serviço de nova venda.
   */
  public saleType(): Observable<SaleType> {
    return this.saleServiceType.asObservable();
  }

  /**
   * Retorna um observable que emite quando o serviço de venda é redefinido.
   */
  public onServiceReset(): Observable<void> {
    return this.serviceReset.asObservable();
  }

  /**
   * Retorna um observable que emite se está salvando uma venda/orçamento ou não.
   */
  public saving(): Observable<boolean> {
    return this.isSaving.asObservable();
  }

  /**
   * Retorna se pode sair da página de nova venda sem exibir a mensagem de confirmação.
   */
  public canLeaveNewSale(): boolean {
    return this.saleProducts.getValue().length === 0;
  }

  /**
   * Retorna se pode sair da página de edição sem exibir a mensagem de confirmação.
   */
  public canLeaveSaleEdition(): boolean {
    return !this.unsavedChanges;
  }

  /**
   * Retorna a operação que o serviço está gerenciando no momento da chamada desta função.
   * @private
   */
  public getCurrentSaleType(): SaleType {
    return this.saleServiceType.getValue();
  }

  public setSalePayments(payments: NewSalePaymentsValues): void {
    this.salePayments = payments;
  }

  /**
   * Salva uma nova venda, uma nova a partir de um orçamento, ou a edição de uma venda.
   */
  private saveSale(): void {

    // Define que está salvando
    this.isSaving.next(true);

    // Recupera os dados para salvar
    const sale = this.getSaleForSaving();

    // Verifica se está criando uma venda a partir de um orçamento
    const originFromQuote = this.getCurrentSaleType() === 'edit-quote';

    // Se está salvando uma nova venda a partir de um orçamento, define o código de origem
    if (originFromQuote) {
      sale.quoteCode = this.saleCode;
    } else {

      // Se está editando uma venda, define o código
      sale.code = this.saleCode;

    }

    // Se é uma nova venda ou não
    const isNewSale = !sale.code;

    this.posService.saveSale(sale).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Verifica se salvou uma nova venda ou a edição de uma
      if (isNewSale) {

        // Se é uma nova venda, recupera o código da venda salva para impressão
        const saleCode = response.code;

        // Gerencia a resposta de salvar a nova venda
        this.handleSavingNewResponse(false, saleCode);

        // Se a venda foi criada a partir de um orçamento, retorna para a página de vendas
        if (originFromQuote) {
          this.router.navigate(['/sales/new-sale']).then();
          return;
        }

      } else {

        // Gerencia a resposta de editar uma venda
        this.handleEditingResponse(false);

      }

    }, () => this.handleSavingError());

  }

  private openSalePaymentValues(): void {

    this.blockOpeningInteractionMenus();

    // Como a janela de pagamentos está sendo aberta no serviço de nova venda, não é possível informar o viewContainerRef para
    // acessar o serviço no componente, então injetamos o valor total da venda e recuperamos os pagamentos quando o menu é fechado.
    this.sideMenu.open(NewSalePaymentComponent, {autoFocus: false, data: this.getTotal()}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe((payments: NewSalePaymentsValues) => {

      this.unlockOpeningInteractionMenus();
      if (payments) {
        this.setSalePayments(payments);
        this.saveSale();
      }

    });

  }

  /**
   * Salva um novo orçamento ou a edição de um.
   * @private
   */
  private saveQuote(): void {

    // Define que está salvando
    this.isSaving.next(true);

    // Recupera os dados para salvar
    const quote = this.getSaleForSaving();

    // Define o código, caso esteja editando um orçamento
    quote.code = this.saleCode;

    // Se é um novo orçamento ou não
    const isNewQuote = !quote.code;

    this.posService.saveQuote(quote).pipe(takeUntil(this.unsub)).subscribe(response => {

      // Verifica se salvou um novo orçamento ou a edição de um
      if (isNewQuote) {

        // Se é um novo orçamento, recupera o código do orçamento salvo para impressão
        const quoteCode = response.code;

        // Gerencia a resposta de salvar o novo orçamento
        this.handleSavingNewResponse(true, quoteCode);

      } else {

        // Gerencia a resposta de editar uma venda
        this.handleEditingResponse(true);

      }

    }, () => this.handleSavingError());

  }

  /**
   * Gerencia o salvamento de uma nova venda ou orçamento
   * @param quote Se está salvando um novo orçamento.
   * @param codeForPrinting O código da venda ou orçamento salvo para impressão.
   * @private
   */
  private handleSavingNewResponse(quote: boolean, codeForPrinting: number): void {

    // Redefine o serviço
    this.resetSale();

    // Exibe a mensagem de sucesso
    let message: string;
    message = quote ? 'Orçamento salvo com sucesso' : 'Venda finalizada com sucesso';
    this.snackBar.open(message, null, {duration: 2500, panelClass: 'sucesso'});

    // Se não está salvando uma edição, imprime a nova venda/orçamento
    if (this.postSalePrintCopies > 0 && codeForPrinting) {
      this.printSaleAfterSaving(codeForPrinting, quote);
    }

  }

  /**
   * Exibe a mensagem de edição salva com sucesso e navega para a página anterior.
   * @param quote Se exibe a mensagem como orçamento ou venda atualizada.
   * @private
   */
  private handleEditingResponse(quote: boolean): void {

    // Venda atualizada com sucesso
    const message = quote ? 'Orçamento atualizado com sucesso' : 'Venda atualizada com sucesso';
    this.snackBar.open(message, null, {duration: 3500, panelClass: 'sucesso'});

    // Redefine a variável de alterações para poder deixar a página
    this.unsavedChanges = false;

    // Navega para a página parente
    this.navigateToParent(false, true);

  }

  /**
   * Define que não está salvando e libera a abertura dos menus de interação.
   * @private
   */
  private handleSavingError(): void {

    this.isSaving.next(false);
    this.unlockOpeningInteractionMenus();

  }

  /**
   * Retorna se a venda ou orçamento pode ser salva no momento.
   * Se ela não possui produtos, exibe uma mensagem ao usuário.
   */
  public canSave(): boolean {

    // Verifica se já está salvando a venda e se não está tentando utilizar o atalho com uma janela aberta
    if (this.isSaving.getValue() || !this.canOpenInteractionMenu()) {
      return false;
    }

    // Verifica produtos foram informados
    const numberOfProducts = this.saleProducts.getValue().length;
    if (numberOfProducts === 0) {
      this.snackBar.open('Não é possível finalizar uma venda sem produtos', null, {duration: 2000, panelClass: 'falha'});
      return false;
    }

    // Verifica se é necessário informar um cliente para a venda
    if (this.requiredCustomer && !this.getSaleCustomer()) {

      this.snackBar.open('Informe um cliente para finalizar a venda', null, {duration: 2000, panelClass: 'falha'});
      return false;

    }

    // Verifica se é necessário informar um vendedor para a venda
    if (this.requiredSeller && !this.getSeller()) {

      this.snackBar.open('Informe um vendedor(a) para finalizar a venda', null, {
        duration: 2000,
        panelClass: 'falha'
      });

      return false;

    }

    return true;

  }

  /**
   * Retorna a venda para salvar
   * @private
   */
  private getSaleForSaving(): NewSale {

    const payments = this.salePayments;

    return {
      discount: this.saleDiscountValue.getValue(),
      shipping: this.saleShippingValue.getValue(),
      customerCode: this.saleCustomer.getValue()?.code,
      observation: this.saleObservation.getValue(),
      products: this.saleProducts.getValue(),
      cash: payments?.cash,
      credit: payments?.credit,
      debit: payments?.debit,
      others: payments?.others,
      saleChange: payments?.change,
      sellerCode: this.getSeller()?.code
    };

  }

  /**
   * Inscreve para sempre que ocorrer uma alteração na lista de produtos, no valor de desconto ou frete,
   * calcular os valores da venda.
   * @private
   */
  private registerValuesWatcher(): void {

    // Inscrevemos para sempre que ocorrer uma alteração na lista de produtos, no valor de desconto ou no frete,
    // os valores da venda sejam calculados
    merge(this.saleProducts.asObservable(), this.saleShippingValue.asObservable(), this.saleDiscountValue.asObservable())
      .pipe(takeUntil(this.unsub)).subscribe(() => {
      this.calculateSaleValues();
    });

  }

  /**
   * Registra para que quando ocorrer uma alteração na lista de produtos, definir o status da lista de produtos.
   * @private
   */
  private registerProductsStatusWatcher(): void {

    // Verificar se é possível unificar esta inscrição diretamente no BehaviorSubject de status da lista de produtos
    this.saleProducts.asObservable().pipe(map(products => products.length), takeUntil(this.unsub)).subscribe(numberOfProducts => {
      this.productsStatus.next(numberOfProducts > 0 ? 'pronto' : 'vazio');
    });

  }

  /**
   * Calcula e emite os valores de subtotal dos produtos e total da venda.
   * @private
   */
  private calculateSaleValues(): void {

    // Primeiramente calculamos o valor dos produtos
    const productsSubtotal = this.calculateProductsSubtotal();
    this.saleProductsSubtotal.next(productsSubtotal.toNumber());

    // Valor de frete e desconto
    const discount = new Big(this.saleDiscountValue.getValue() || 0);
    const shipping = new Big(this.saleShippingValue.getValue() || 0);
    const saleTotal = productsSubtotal.add(shipping).sub(discount);
    this.saleTotal.next(saleTotal.toNumber());

  }

  /**
   * Calcula o valor dos produtos da venda.
   * @private
   */
  private calculateProductsSubtotal(): Big {

    const saleProducts = this.saleProducts.getValue();
    if (saleProducts.length === 0) {
      return new Big(0);
    }

    return saleProducts.map(product => {

      const productValue = new Big(product.value);
      const quantity = new Big(product.quantity);
      return productValue.mul(quantity);

    }).reduce((previous, current) => previous.add(current), new Big(0));

  }

  /**
   * Se a nova venda foi iniciada através de um cliente, o define como o cliente da venda.
   * @private
   */
  private setNewSaleCustomer(): void {

    const newSaleCustomer = this.customerService.getNewSaleCustomer();
    if (newSaleCustomer) {
      this.setSaleCustomer(newSaleCustomer);
    }

  }

  /**
   * Retorna a operação que o serviço está gerenciando no momento que o componente de venda é inicializado.
   * A criação de uma nova venda (new-sale), edição de uma venda (edit-sale) ou a edição de um orçamento (edit-quote).
   * Se está criando uma venda, verifica também se o cliente já foi selecionado.
   * @private
   */
  private getRouteSaleType(saleCode: number | undefined): SaleType {

    const currentUrl = this.router.url;
    const isQuote = currentUrl.startsWith('/quotes');

    if (!saleCode) {

      // Verifica se existe um cliente para a nova venda
      this.setNewSaleCustomer();
      return 'new-sale';

    } else {
      return saleCode && isQuote ? 'edit-quote' : 'edit-sale';
    }

  }

  /**
   * Carrega o código da venda ou orçamento informado na rota verificando se ele é válido, se não
   * navega para a página de anterior
   * @private
   */
  private getRouteSaleCode(): number | undefined {

    // Define o código da venda ou orçamento que será carregada, caso ele exista
    if (this.acRoute.snapshot.paramMap.has('saleCode')) {

      // Converte o número informado usando a função parseInt
      const parsedSaleCode = Number.parseInt(this.acRoute.snapshot.paramMap.get('saleCode'), 10);

      // Se não é um código de venda/orçamento válido, navega para a página anterior.
      if (Number.isNaN(parsedSaleCode) || parsedSaleCode < 1) {
        this.navigateToParent();
      }

      return parsedSaleCode;

    }

    return undefined;

  }

  /**
   * Navega para a url da rota parente se o código informado for inválido.
   * @param showCodeErrorMessage Se deve exibir uma mensagem informando que o código da venda/orçamento é inválido, exibe por padrão.
   * @param mergeParams Se deve manter os parâmetros de busca ao retornar para a página anterior, não por padrão.
   * @private
   */
  private navigateToParent(showCodeErrorMessage = true, mergeParams = false): void {

    const quotes = this.router.url.startsWith('/quotes');
    const parentRoute = quotes ? '/quotes' : '/sales';

    if (showCodeErrorMessage) {
      const message = quotes ? 'Código do orçamento inválido' : 'Código da venda inválido';
      this.snackBar.open(message, null, {duration: 2500, panelClass: 'falha'});
    }

    this.router.navigate([parentRoute], {queryParamsHandling: mergeParams ? 'merge' : undefined}).then();

  }

  /**
   * Realiza a requisição dos dados de uma venda para compartilhamento
   * @param saleCode O código da venda para impressão
   * @param quote Se deve carregar e imprimir um orçamento
   */
  private printSaleAfterSaving(saleCode: number, quote: boolean): void {

    this.posService.getSaleForPrint(saleCode, quote).pipe(takeUntil(this.unsub)).subscribe((response => {

      const receiptType = response.print.receiptType;

      if (receiptType === RECEIPT_TYPE.COUPON_80 || receiptType === RECEIPT_TYPE.COUPON_52) {

        const couponType: CouponType = receiptType === RECEIPT_TYPE.COUPON_80 ? '80' : '52';
        new SaleCouponHelper(response, quote, couponType, {
          left: response.print.couponMarginLeft,
          right: response.print.couponMarginRight
        }, this.postSalePrintCopies, this.logoService.getLogo()).print();

      } else {

        const halfPage = receiptType === RECEIPT_TYPE.A4_HALF_PAGE;
        new SaleReceiptHelper(response, quote, halfPage, this.postSalePrintCopies, this.logoService.getLogo()).print();

      }

    }));

  }

}
