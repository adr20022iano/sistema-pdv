import {NewPdfHelper} from '../../shared/helpers/new-pdf-helper';
import {DateHelper} from '../../shared/helpers/date-helper';
import {SaleForPrint} from '../models/sale-for-print';
import {PHONE_ICON} from './sale-receipt-helper';
import * as printJS from 'print-js';
import {NumbersHelper} from '../../shared/helpers/numbers-helper';
import {version} from 'package.json';
import {formatCompanyAddress, formatCustomerAddress, getImageSize} from './pdf-helper-functions';

/** As dimensões máximas da logo */
const logoMaxDimensions = {width: 40, height: 40};

export class SaleCouponHelper extends NewPdfHelper {

  /** A data da impressão do documento */
  private readonly printDate = DateHelper.dateToFormattedString(new Date(), 'dd/MM/yy • HH:mm:ss');

  /** A versão do sistema */
  private readonly appVersion = version;

  /** O tamanho padrão da fonte do documento */
  private readonly defaultFontSize: number;

  constructor(private sale: SaleForPrint, private quote: boolean, private couponType: CouponType = '80',
              private margins: CouponMargins, private copies = 1, private logo?: HTMLImageElement) {

    super('p', [couponType === '80' ? 80 : 52, 210]);

    this.defaultFontSize = couponType === '80' ? 8 : 6;

    this.printCopy();

  }

  /**
   * Cria o PDF da venda que está sendo impressa, se deve imprimir duas vias, esta função irá se invocar novamente após
   * redefinir alguns valores de controle.
   * @private
   */
  private printCopy(): void {

    for (let i = 1; i <= this.copies; i++) {

      this.setYPos(10);
      this.addCompanyDetails();
      this.addCustomerDetails();
      this.addSaleObservation();
      this.addSellerDetails();
      this.addProducts();
      this.addSaleValues();
      this.addSignatureField();
      this.addFooterNotes();

      if (i < this.copies) {
        this.doc.addPage();
        this.setYPos(10);
      }

    }

  }

  /**
   * Adiciona os dados da empresa
   * @private
   */
  private addCompanyDetails(): void {

    const xPos = this.margins.left;
    let yPos = 10;
    const docWidth = this.docWidth();

    const companyName = this.sale.print.fantasyName;
    if (this.logo) {

      // Posiciona a logo no meio do cupom
      const logoWidth = this.logo.width;
      const logoHeight = this.logo.height;
      const logoDimensions = getImageSize(logoWidth, logoHeight, logoMaxDimensions.width, logoMaxDimensions.height);

      // Usamos a largura máxima do texto para determinar a posição da imagem, pois, ela já contabiliza as margens esquerda e direita
      const logoXPos = (docWidth / 2) - (logoDimensions.width / 2);

      this.doc.addImage(this.logo, 'WEBP', logoXPos, yPos, logoDimensions.width, logoDimensions.height, 'logo');
      yPos += logoDimensions.height + 5;

    } else if (companyName) {

      this.doc.setFontSize(10);
      this.setFontStyle('bold');
      this.doc.text(companyName.toUpperCase(), docWidth / 2, yPos, {align: 'center'});
      yPos += 5;

    }

    // Código e data da venda
    this.doc.setFontSize(this.defaultFontSize);
    this.setFontStyle('bold');
    const saleCodeLabel = this.quote ? 'ORÇAMENTO #' : 'VENDA #'.concat(this.sale.code.toString());
    this.doc.text(saleCodeLabel, xPos, yPos);
    this.setFontStyle('normal');
    this.doc.setFontSize(this.defaultFontSize);

    this.doc.text(DateHelper.dateToFormattedString(new Date(this.sale.date), 'dd/MM/yy • HH:mm'),
      this.maxXPos(), yPos, {align: 'right'});

    yPos += 4;

    // Endereço
    const companyAddress = formatCompanyAddress(this.sale);
    if (companyAddress) {

      // Dimensões do endereço
      const addressDimensions = this.doc.getTextDimensions(companyAddress, {maxWidth: docWidth});
      this.doc.text(companyAddress, xPos, yPos, {maxWidth: docWidth});
      yPos += addressDimensions.h;

    }

    // Contato
    if (this.sale.print.phone) {
      this.doc.addImage(PHONE_ICON, xPos, yPos, 3, 3, 'phone_icon');
      this.setFontStyle('bold');
      this.doc.text(this.sale.print.phone, xPos + 4, yPos + 2);
      yPos += 4.5;
      this.setFontStyle('normal');
    }

    // Divisor
    this.addDivider(xPos, yPos, this.maxXPos());
    this.setYPos(yPos + 4);

  }

  /**
   * Adiciona os dados do cliente
   * @private
   */
  private addCustomerDetails(): void {

    if (!this.sale.customer) {
      return;
    }

    let yPos = this.getYPos();
    const xPos = this.margins.left;
    const docWidth = this.docWidth();

    // Nome do cliente
    const customer = this.sale.customer;
    this.setFontStyle('bold');
    this.doc.text('CLIENTE • '.concat(customer.code.toString()), xPos, yPos);
    this.setFontStyle('normal');
    yPos += 3;

    const customerDetails = customer.name.concat(customer.nickname ? ['(', customer.nickname, ')'].join() : '');
    const customerNameDimensions = this.doc.getTextDimensions(customerDetails, {maxWidth: docWidth});
    this.doc.text(customerDetails, xPos, yPos, {maxWidth: docWidth});
    yPos += customerNameDimensions.h + 2;

    // Telefone do cliente
    if (customer.phone) {

      this.setFontStyle('bold');
      this.doc.text('CONTATO', xPos, yPos);
      yPos += 3;
      this.setFontStyle('normal');
      this.doc.text(customer.phone, xPos, yPos);
      yPos += 5;

    }

    const customerAddress = formatCustomerAddress(customer);
    if (customerAddress) {

      this.setFontStyle('bold');
      this.doc.text('ENDEREÇO DE ENTREGA', xPos, yPos);
      this.setFontStyle('normal');
      yPos += 3;

      const customerAddressDimensions = this.doc.getTextDimensions(customerAddress, {maxWidth: docWidth});
      this.doc.text(customerAddress, xPos, yPos, {maxWidth: docWidth});
      yPos += customerAddressDimensions.h;

    }

    this.addDivider(xPos, yPos, this.maxXPos());
    this.setYPos(yPos + 4);

  }

  /**
   * Adiciona a observação da venda
   * @private
   */
  private addSaleObservation(): void {

    const saleObs = this.sale.observation;
    if (!saleObs) {
      return;
    }

    let yPos = this.getYPos();
    const xPos = this.margins.left;
    const docWidth = this.docWidth();

    yPos += 2;
    this.setFontStyle('bold');
    this.doc.text('OBSERVAÇÃO', xPos, yPos);
    this.setFontStyle('normal');
    yPos += 3;

    const observationDimensions = this.doc.getTextDimensions(saleObs, {maxWidth: docWidth});
    this.doc.text(saleObs, xPos, yPos, {maxWidth: docWidth});
    yPos += observationDimensions.h;

    this.addDivider(xPos, yPos, this.maxXPos());
    this.setYPos(yPos + 4);

  }

  /**
   * Adiciona os detalhes do vendedor.
   * @private
   */
  private addSellerDetails(): void {

    const seller = this.sale.seller;
    if (!seller) {
      return;
    }

    let yPos = this.getYPos();
    const xPos = this.margins.left;
    // Nome do Vendedor
    this.setFontStyle('bold');
    this.doc.text('VENDEDOR', xPos, yPos);
    yPos += 3;
    this.setFontStyle('normal');
    const sellerDetails = seller.code.toString().concat(' • ', seller.name);
    this.doc.text(sellerDetails, xPos, yPos);
    this.addDivider(xPos, yPos += 2, this.maxXPos());
    this.setYPos(yPos + 4);

  }

  /**
   * Adiciona os produtos
   * @private
   */
  private addProducts(): void {

    let yPos = this.getYPos();
    const xPos = this.margins.left;
    this.setFontStyle('bold');
    this.doc.text('PRODUTOS', this.maxXPos() / 2, yPos, {align: 'center'});
    const docMaxWidth = this.docWidth();
    yPos += 4;

    const products = this.sale.products;
    const numberOfProducts = products.length;
    products.forEach((product, index) => {

      // Nome do produto
      this.setFontStyle('bold');
      const nameWithCode = product.code.toString().concat(' - ', product.name);
      const nameDimensions = this.doc.getTextDimensions(nameWithCode, {maxWidth: docMaxWidth});
      this.doc.text(nameWithCode, xPos, yPos, {maxWidth: docMaxWidth});
      yPos += nameDimensions.h + 0.2;

      // Subtotal
      const productSubtotal = NumbersHelper.formatCurrency(product.subtotal);
      this.doc.text(productSubtotal, this.maxXPos(), yPos, {align: 'right'});

      // Quantidade
      this.setFontStyle('normal');
      const productQuantity = product.quantity.toString().concat(' ', product.unit, ' X ', NumbersHelper.formatCurrency(product.value));
      this.doc.text(productQuantity, xPos, yPos);

      this.addDivider(xPos, yPos += 2, this.maxXPos(), index + 1 !== numberOfProducts);
      yPos += 4;

      // Verifica se deve adicionar uma nova página após o produto
      if (index < numberOfProducts - 1 && yPos > 200) {
        this.doc.addPage();
        this.setYPos(4);
        yPos = 4;
      }

    });

    this.setYPos(yPos);

  }

  /**
   * Adiciona os valores da venda
   * @private
   */
  private addSaleValues(): void {

    let yPos = this.getYPos();

    if (210 - yPos < 60) {
      this.doc.addPage();
      this.setYPos(4);
      yPos = 4;
    }

    // Total dos produtos
    const totalItens = this.sale.itemsTotal;
    const itensLabel = totalItens === 1 ? 'Item' : 'Itens';
    this.doc.setFontSize(this.couponType === '80' ? 5 : 4);
    this.doc.text(NumbersHelper.formatNumber(this.sale.itemsTotal).concat(' ', itensLabel), this.margins.left, yPos);
    this.doc.setFontSize(this.defaultFontSize);
    this.addSaleValue(yPos, this.sale.productsTotal, 'Total de produtos: ');
    yPos += 5;

    // Total da venda
    this.addSaleValue(yPos, this.sale.saleTotal, 'Total da venda: ', true);
    yPos += 4;

    // Valor pago
    if (this.sale.paidValue) {
      this.addSaleValue(yPos, this.sale.paidValue, 'Valor pago: ');
      yPos += 4;
    }

    // Frete
    if (this.sale.shipping) {
      this.addSaleValue(yPos, this.sale.shipping, 'Frete: ');
      yPos += 4;
    }

    // Desconto
    if (this.sale.discount) {
      this.addSaleValue(yPos, this.sale.discount, 'Desconto: ');
      yPos += 4;
    }

    this.setYPos(yPos);

  }

  /**
   * Adiciona um dos valores do rodapé da venda
   * @private
   */
  private addSaleValue(yPos: number, value: number, label: string, saleTotal = false): void {

    const xPos = this.maxXPos();
    if (saleTotal) {
      this.doc.setFontSize(this.couponType === '80' ? 12 : 7);
    }

    const formattedValue = NumbersHelper.formatCurrency(value);
    this.setFontStyle('bold');
    const valueWidth = this.doc.getTextWidth(formattedValue);
    this.doc.text(formattedValue, xPos, yPos, {align: 'right'});

    if (!saleTotal) {
      this.setFontStyle('normal');
    }

    this.doc.text(label, xPos - valueWidth, yPos, {align: 'right'});

    if (saleTotal) {
      this.doc.setFontSize(this.defaultFontSize);
      this.setFontStyle('normal');
    }

  }

  /**
   * Adiciona o campo de assinatura
   * @private
   */
  private addSignatureField(): void {

    const yPos = this.getYPos() + 10;
    const xPos = this.margins.left;
    this.doc.setFontSize(6);
    this.addDivider(xPos, yPos, this.maxXPos());
    this.doc.text('Ass. cliente', xPos, yPos + 2.5);
    this.doc.setFontSize(this.defaultFontSize);
    this.setYPos(yPos + 6);

  }

  /**
   * Adiciona os detalhes do footer
   * @private
   */
  private addFooterNotes(): void {

    let yPos = this.getYPos();
    const maxDocWidth = this.docWidth();

    // Observação de impressão
    const printObs = this.sale.print.saleObservation;
    if (printObs) {
      const obsDimensions = this.doc.getTextDimensions(printObs, {maxWidth: maxDocWidth});
      this.doc.text(printObs, this.maxXPos() / 2, yPos, {maxWidth: maxDocWidth, align: 'center'});
      yPos += obsDimensions.h;
    }

    // Data de impressão
    this.doc.setFontSize(5);
    this.doc.text('Impresso em: '.concat(this.printDate), this.maxXPos() / 2, yPos, {align: 'center'});
    yPos += 3;

    // Aviso fiscal
    this.setFontStyle('bold');
    const notice = '* ESTE DOCUMENTO NÃO TEM VALIDADE FISCAL *';
    const noticeDimensions = this.doc.getTextDimensions(notice, {maxWidth: maxDocWidth});
    this.doc.text(notice, this.maxXPos() / 2, yPos, {maxWidth: maxDocWidth, align: 'center'});
    yPos += noticeDimensions.h;

    // Assinatura DEVAP
    this.setFontStyle('normal');
    this.doc.setFontSize(4);
    this.doc.text('Desenvolvido por DEVAP', this.maxXPos() / 2, yPos, {align: 'center'});
    yPos += 1.5;
    this.doc.text('www.devap.com.br • Versão: '.concat(this.appVersion), this.maxXPos() / 2, yPos, {align: 'center'});
    this.doc.setFontSize(this.defaultFontSize);

  }

  /**
   * Realiza a impressão do PDF criado.
   */
  public print(): void {

    const fileUrl = this.getFileURL();
    printJS(fileUrl);

  }

  /**
   * Retorna a largura do documento considerando a margem direita.
   * @see {@link NewPdfHelper.maxXPos}
   */
  public maxXPos(): number {
    // Já que as impressoras de cupom podem cortar o conteúdo devido seu hardware,
    // subtraímos a margem direita.
    return this.doc.internal.pageSize.getWidth() - this.margins.right;
  }

  /**
   * Retorna a largura do documento considerando ambas margens direita e esquerda.
   */
  public docWidth(): number {
    return this.doc.internal.pageSize.getWidth() - (this.margins.right + this.margins.left);
  }

}

export type CouponType = '80' | '52';

/** Margens do cupom em PDF */
export interface CouponMargins {
  left: number;
  right: number;
}
