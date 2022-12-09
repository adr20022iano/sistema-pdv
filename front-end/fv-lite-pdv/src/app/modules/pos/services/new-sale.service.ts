import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {SaleProduct} from '../models/sale-product';
import {Customer} from '../../customers/models/customer';
import {takeUntil} from 'rxjs/operators';
import {SaleForEdition} from '../models/sale-for-edition';
import {NewSale} from '../models/new-sale';

@Injectable()
export class NewSaleService implements OnDestroy {

  /** Produtos da venda */
  saleProducts = new BehaviorSubject<SaleProduct[]>([]);

  /** Subtotal dos produtos da venda */
  productsSubtotal = new BehaviorSubject<number>(0);

  /** O valor total da venda */
  saleTotal = new BehaviorSubject<number>(0);

  /** O valor de frete da venda */
  shippingValue = new BehaviorSubject<number>(0);

  /** O valor de desconto da venda */
  discountValue = new BehaviorSubject<number>(0);

  /** A observação da venda */
  saleObservation = new BehaviorSubject('');

  /** O cliente da venda */
  saleCustomer = new BehaviorSubject<Customer>(undefined);

  /** O código da venda que está sendo editada */
  saleBeingEditedCode: number;

  /** Se está editando uma venda ou não */
  editingSale = false;

  /** Se está editando um orçamento */
  editingQuote = false;

  /** Se existem alterações não salvas na venda */
  unsavedChanges = false;

  /** BehaviorSubject usado para exibir o código da venda carregada para edição/visualização  */
  saleBeingEditedCodeAsync = new BehaviorSubject<number>(0);

  /** O último produto que foi removido da venda */
  private lastRemovedProduct: { productIndex: number, product: SaleProduct };

  /** Se algum menu de interação está aberto */
  private interactionMenuOpened = false;

  /** Emite durante o encerramento do serviço para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor() {

    // Inscrevemos para que sempre que ocorrer uma alteração na lista de produtos,
    // no valor de desconto ou no frete, os valores da venda sejam calculados
    merge(this.saleProducts.asObservable(), this.shippingValue.asObservable(), this.discountValue.asObservable())
      .pipe(takeUntil(this.unsub)).subscribe(() => {
      this.calculateSaleValues();
    });

  }

  ngOnDestroy(): void {
    this.unsub.next();
    this.unsub.complete();
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
      this.updateProduct(index, currentProducts[index].quantity + product.quantity);

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
   */
  public updateProduct(productIndex: number, newQuantity: number, newValue?: number) {

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
   * Desfaz a remoção do último produto que foi removido da venda
   */
  public undoLastRemoval() {

    if (this.lastRemovedProduct) {

      const index = this.lastRemovedProduct.productIndex;
      const product = this.lastRemovedProduct.product;
      let saleProducts = this.saleProducts.getValue();

      // Para podermos adicionar um item na sua posição anterior, dividimos os itens
      // em dois arrays diferentes, os que estão antes da posição do item, e os que estão
      // a partir da sua posição, então usamos o spread operator para montar um novo array
      // com o item anterior entre as duas seções.
      saleProducts = [...saleProducts.slice(0, index), product, ...saleProducts.slice(index)];
      this.saleProducts.next(saleProducts);
      this.lastRemovedProduct = undefined;

    }

  }

  /**
   * Define os parâmetros da venda que está sendo editada
   * no serviço.
   * @param sale A venda que foi carregada para edição.
   * @param quote Se a venda carregada no serviço é um orçamento.
   */
  public setSaleForEdition(sale: SaleForEdition, quote = false): void {

    this.saleProducts.next(sale.products);
    this.saleCustomer.next(sale.customer);
    this.saleObservation.next(sale.observation);
    this.discountValue.next(sale.discount);
    this.shippingValue.next(sale.shipping);
    this.saleBeingEditedCode = sale.code;
    this.saleBeingEditedCodeAsync.next(this.saleBeingEditedCode);
    this.editingSale = true;
    this.editingQuote = quote;

  }

  /**
   * Retorna a venda para salvamento
   */
  public getSaleForSaving(): NewSale {

    return {
      code: this.editingSale ? this.saleBeingEditedCode : undefined,
      products: this.saleProducts.getValue(),
      discount: this.discountValue.getValue(),
      shipping: this.shippingValue.getValue(),
      customerCode: this.saleCustomer.getValue().code,
      observation: this.saleObservation.getValue()
    };

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
   * Define o valor de frete da venda.
   * @param shippingValue O valor do frete.
   */
  public setSaleShippingValue(shippingValue: number): void {
    this.shippingValue.next(shippingValue);
    this.unsavedChanges = true;
  }

  /**
   * Define o valor de desconto da venda.
   * @param discountValue O valor do desconto.
   */
  public setSaleDiscountValue(discountValue: number): void {
    this.discountValue.next(discountValue);
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
   * Redefine os valores do serviço após uma venda ser finalizada
   * para preparar os componentes para uma nova venda.
   * PS. Após a edição de uma venda, como saímos do componente de edição de venda
   * o serviço é destruído automaticamente.
   */
  public resetService(): void {

    this.saleProducts.next([]);
    this.saleCustomer.next(undefined);
    this.saleObservation.next('');
    this.discountValue.next(0);
    this.shippingValue.next(0);
    this.lastRemovedProduct = undefined;
    this.unsavedChanges = false;

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
   * Calcula e emite os valores de subtotal dos produtos e total da venda.
   * @private
   */
  private calculateSaleValues(): void {

    // Primeiramente calculamos o valor dos produtos
    const productsSubtotal = this.calculateProductsSubtotal();
    this.productsSubtotal.next(productsSubtotal);

    // Valor de frete e desconto
    const discount = this.discountValue.getValue();
    const shipping = this.shippingValue.getValue();
    const saleTotal = productsSubtotal + shipping - discount;
    this.saleTotal.next(saleTotal);

  }

  /**
   * Calcula o valor dos produtos da venda.
   * @private
   */
  private calculateProductsSubtotal(): number {

    const saleProducts = this.saleProducts.getValue();
    return saleProducts.length === 0 ? 0 : saleProducts.map(product => product.value * product.quantity)
      .reduce((previous, current) => previous + current, 0);

  }

}
