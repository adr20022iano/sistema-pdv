import {SaleForPrint} from '../models/sale-for-print';
import {CellHookData, UserOptions} from 'jspdf-autotable';
import {NewPdfHelper, PdfTableColumn, PdfTableColumnStyles} from '../../shared/helpers/new-pdf-helper';
import {NumbersHelper} from '../../shared/helpers/numbers-helper';
import {DateHelper} from '../../shared/helpers/date-helper';
import {version} from '../../../../../package.json';
import {GState} from 'jspdf';
import * as printJS from 'print-js';
import {formatCompanyAddress, formatCustomerAddress, getImageSize} from './pdf-helper-functions';

export class SaleReceiptHelper extends NewPdfHelper {

  /** Largura do código da venda */
  saleCodeWidth: number;

  /** Se está imprimindo a via do cliente no momento */
  private printingDuplicate: boolean;

  /** O número de páginas por via do documento */
  private pagesByCopy = 0;

  /** A data da impressão do documento */
  private readonly printDate = DateHelper.dateToFormattedString(new Date(), 'dd/MM/yy • HH:mm:ss');

  /**
   * Realiza a impressão de uma venda.
   * @param sale A venda que está sendo impressa.
   * @param quote Se está imprimindo um orçamento ou não.
   * @param halfPage Se o papel é meia folha A4
   * @param copies O número de cópias para criar.
   * @param logo A logo da empresa.
   */
  constructor(private sale: SaleForPrint, private quote?: boolean, private halfPage = false, private copies = 1,
              private logo?: HTMLImageElement) {

    // Se for impressão meia página, imprimimos em modo paisagem, com tamanho de meia folha
    super(halfPage ? 'l' : 'p', halfPage ? [210, 148.5] : 'a4');
    this.printCopy();

  }

  /** Versão do aplicativo */
  private readonly appVersion = version;

  /**
   * Cria a tabela dos produtos para impressão.
   * @param saleForPrint A venda retornada pelo webservice.
   * @private
   */
  private static getProductsTable(saleForPrint: SaleForPrint): UserOptions {

    // Definição das colunas da tabela
    const productsColumnDef: PdfTableColumn[] = [
      {header: 'Código', dataKey: 'code'},
      {header: 'Produto', dataKey: 'name'},
      {header: 'Quantidade', dataKey: 'quantity'},
      {header: 'Unitário', dataKey: 'value'},
      {header: 'Total', dataKey: 'subtotal'}
    ];

    const productsColumnStyles: PdfTableColumnStyles = {
      code: {halign: 'center', valign: 'middle'},
      value: {halign: 'right', valign: 'middle'},
      subtotal: {halign: 'right', valign: 'middle'},
      quantity: {halign: 'right', valign: 'middle'}
    };

    // Formata os valores dos produtos
    const products = saleForPrint.products.map(product => {
      return {
        ...product,
        value: NumbersHelper.formatCurrency(product.value),
        subtotal: NumbersHelper.formatCurrency(product.subtotal),
        quantity: product.quantity.toString().concat(' ', product.unit)
      };
    });

    return {
      columns: productsColumnDef,
      columnStyles: productsColumnStyles,
      body: products,
      foot: [[
        {content: ''},
        {content: ''},
        {content: NumbersHelper.formatNumber(saleForPrint.itemsTotal), styles: {halign: 'right'}},
        {content: ''},
        {content: NumbersHelper.formatCurrency(saleForPrint.productsTotal), styles: {halign: 'right'}},
      ]]
    };

  }

  /**
   * Realiza a impressão do PDF criado.
   */
  public print(): void {

    const fileUrl = this.getFileURL();
    console.log('FIle url', fileUrl);
    printJS(fileUrl);

  }

  /**
   * Cria o PDF da venda que está sendo impressa, se deve imprimir duas vias, esta função irá se invocar novamente após
   * redefinir alguns valores de controle.
   * @private
   */
  private printCopy(): void {

    for (let i = 1; i <= this.copies; i++) {

      this.addHeader();
      this.addProducts();
      this.addSaleFooter();
      this.addPageFooter();
      this.addPagesNumbers();

      if (i < this.copies) {
        this.printingDuplicate = true;
        this.doc.addPage();
        this.setYPos(10);
      }

    }

  }

  /**
   * Adiciona o header da venda ao documento.
   * @private
   */
  private addHeader(): void {

    // Detalhes da empresa
    this.addCompanyDetails();

    // Dados do cliente
    if (this.sale.customer) {
      this.addCustomerDetails();
    }

    // Observação da venda
    if (this.sale.observation) {
      this.addObservation();
    }

  }

  /**
   * Adiciona o cabeçalho de venda no documento.
   * @private
   */
  private addCompanyDetails(): void {

    // Verifica se existe logo
    let xPos = 10;
    let yPos = 24.5;
    if (this.logo) {

      // Adiciona a logo da empresa
      console.log('Tentando adicionar logo', this.logo.src);
      const logoDimensions = getImageSize(this.logo.width, this.logo.height, 38, 25);
      this.doc.addImage(this.logo, 'WEBP', 10, 10, logoDimensions.width, logoDimensions.height, 'logo-receipt');
      xPos = logoDimensions.width + 12;
      yPos = Math.max(24.5, logoDimensions.height + 12);

    }

    // Nome da empresa
    const companyName = this.sale.print.fantasyName;
    if (companyName) {

      this.doc.setFontSize(11);
      this.setFontStyle('bold');
      this.doc.text(this.sale.print.fantasyName?.toUpperCase() || '', xPos, 13);

    }


    // Código da venda
    const saleCodeLabel = '#'.concat(this.sale.code.toString());
    this.doc.text(saleCodeLabel, this.maxXPos() - 40, 13, {align: 'right'});
    const saleCodeWidth = this.doc.getTextWidth(saleCodeLabel);
    const saleLabel = this.quote ? 'ORÇAMENTO ' : 'VENDA ';
    this.doc.text(saleLabel, this.maxXPos() - 40 - saleCodeWidth, 13, {align: 'right'});
    this.saleCodeWidth = this.doc.getTextWidth(saleLabel) + saleCodeWidth;

    // Data da venda
    this.setFontStyle('normal');
    this.doc.setFontSize(8);
    this.doc.text(DateHelper.dateToFormattedString(new Date(this.sale.date), 'dd/MM/yy • HH:mm:ss'),
      this.maxXPos(), 17, {align: 'right'});

    // Contatos
    if (this.sale.print.phone) {
      this.doc.addImage(PHONE_ICON, xPos, 15.5, 3, 3, 'phone_icon');
      this.doc.text(this.sale.print.phone, xPos + 4, 17.6);
    }

    // Endereço
    const companyAddress = formatCompanyAddress(this.sale);
    if (companyAddress) {
      this.doc.text(companyAddress, xPos, 22);
    }

    // Vendedor
    if (this.sale.seller?.code) {

      this.doc.text('VENDEDOR: '.concat(this.sale.seller.code.toString(), ' • ', this.sale.seller.name),
        this.maxXPos(),
        22,
        {align: 'right'});

    }

    // Divisor
    this.addDivider(10, yPos);

    // Define a posição Y como a posição após o divider
    this.setYPos(yPos + 4);

  }

  /**
   * Adiciona os detalhes do cliente
   * @private
   */
  private addCustomerDetails(): void {

    let currentYPos = this.getYPos();
    this.setFontStyle('normal');
    this.doc.setFontSize(8);

    // Cliente
    const customer = this.sale.customer;
    const customerYPos = currentYPos;
    const customerName = customer.code.toString()
      .concat(' • ', customer.name, customer.nickname ? ['(', customer.nickname, ')'].join() : '');
    this.doc.text('CLIENTE: '.concat(customerName), 10, customerYPos);
    currentYPos += 4;

    // CNPJ
    const cpfCnpj = customer.document;
    if (cpfCnpj) {
      this.doc.text('CPF/CNPJ: '.concat(customer.document), this.maxXPos(), customerYPos, {align: 'right'});
    }

    // Endereço
    const customerAddress = formatCustomerAddress(customer);
    const customerPhone = customer.phone;
    const addressYPos = currentYPos;
    if (customerAddress) {
      this.doc.text('ENDEREÇO: '.concat(customerAddress), 10, addressYPos);
      currentYPos = addressYPos + 4;
    }

    // Telefone
    if (customerPhone) {

      const rightAlign = customerAddress !== undefined;
      this.doc.text('TELEFONE: '.concat(customer.phone), rightAlign ? this.maxXPos() : 10, addressYPos, {align: rightAlign ? 'right' : 'left'});
      currentYPos = addressYPos + 4;

    }

    // Atualiza a posição Y
    this.setYPos(currentYPos);

  }

  /**
   * Adiciona a observação
   * @private
   */
  private addObservation(): void {

    const currentYPos = this.getYPos();
    const pageMaxWidth = this.doc.internal.pageSize.getWidth() - 20;

    // Medidas do conteúdo
    const splitText = this.doc.splitTextToSize(this.sale.observation, pageMaxWidth);
    const textDimensions = this.doc.getTextDimensions(splitText, {maxWidth: pageMaxWidth, fontSize: 8});

    this.doc.text('OBSERVAÇÃO: '.concat(this.sale.observation), 10, currentYPos, {maxWidth: this.maxXPos() - 10, lineHeightFactor: 1.5});
    const paragraphFinalYPos = currentYPos + textDimensions.h;

    // Atualiza a posição do eixo Y
    this.setYPos(paragraphFinalYPos);

  }

  /**
   * Adiciona a tabela de produtos
   * @private
   */
  private addProducts(): void {

    this.addTable({
      ...SaleReceiptHelper.getProductsTable(this.sale),
      didDrawPage: this.onPageDraw,
      didParseCell: this.didParseCell,
      margin: {top: this.getYPos(), bottom: 30, left: 10, right: 10}
    });

  }

  /**
   * Usado para adicionar conteúdo em cada página após ela ser adicionada.
   */
  private onPageDraw = (data: CellHookData) => {

    if (data.pageNumber > 1) {
      this.addHeader();
    }

    this.addWaterMark();

    // Se não está imprimindo a segunda via, incrementa o contador de páginas
    if (!this.printingDuplicate) {
      this.pagesByCopy++;
    }

  };

  /**
   * Chamado antes de computar a largura da coluna e outros recursos.
   * Use for customizing texts or styles of specific cells after they have been formatted.
   * This hook is called just before the column width and other features are computed.
   * @param cellData
   */
  private didParseCell = (cellData: any) => {

    // Se o produto possui observação, limpamos o conteúdo da célula, para ele ser preenchido após ela ser desenhada
    if (cellData.section === 'body' && cellData.column.dataKey === 'name' && cellData.row.raw.observation) {

      cellData.cell.text = '';
      // Também definimos a altura da linha
      cellData.row.height = 8;

    }

  };

  /**
   * Adiciona o rodapé da página
   * @private
   */
  private addPageFooter(): void {

    // Altura da página
    let initialYPos = this.halfPage ? this.doc.internal.pageSize.getHeight() - 12 : this.getYPos() + 24;

    // Aviso fiscal
    this.doc.setFontSize(6);
    this.setFontStyle('bold');
    this.doc.text('ESTE DOCUMENTO NÃO TEM VALIDADE FISCAL', 10, initialYPos);
    initialYPos += 3;

    // Data de impressão
    this.setFontStyle('normal');
    this.doc.setFontSize(6);
    this.doc.text('IMPRESSO EM: '.concat(this.printDate), 10, initialYPos);
    initialYPos += 2;

    // Assinatura devap
    this.doc.setFontSize(4);
    this.doc.text('Desenvolvido por Devap • www.devap.com.br • Versão '.concat(this.appVersion), 10, initialYPos);

  }

  /**
   * Adiciona o número da página
   * @private
   */
  private addPagesNumbers(): void {

    // Número de páginas no documento atualmente
    const numberOfPages = (this.doc as any).internal.getNumberOfPages();
    let currentPageNumber = 1;

    this.doc.setFontSize(10);
    this.setFontStyle('bold');

    for (let i = 1; i <= numberOfPages; i++) {

      // Vai para a página da iteração atual
      this.doc.setPage(i);

      const page = 'PÁGINA '.concat(currentPageNumber.toString(), ' DE ', this.pagesByCopy.toString());
      this.doc.text(page, this.maxXPos(), 13, {align: 'right'});
      currentPageNumber++;

      // Se a página próxima página, for maior que o número de páginas por cópia, redefine o contador de página atual
      if (currentPageNumber > this.pagesByCopy) {
        currentPageNumber = 1;
      }

    }

    this.doc.setFontSize(8);
    this.setFontStyle('normal');

  }

  /**
   * Adiciona as marcas d'água da página
   * @private
   */
  private addWaterMark(): void {

    if (!this.quote) {
      return;
    }

    const watermark = 'ORÇAMENTO';
    const xPos = 65;
    const yPos = 92;

    this.saveGState();
    this.setFontStyle('bold');
    this.doc.setFontSize(40);
    this.doc.text(watermark, xPos, yPos, null, 32);
    this.restoreGState();

  }

  /**
   * Salva o estado gráfico do documento
   * @private
   */
  private saveGState(): void {

    this.doc.saveGraphicsState();
    const newState = new GState({opacity: 0.3});
    this.doc.setGState(newState);

  }

  /**
   * Restaura o estado gráfico do documento
   * @private
   */
  private restoreGState(): void {

    this.doc.restoreGraphicsState();
    this.doc.setFontSize(8);
    this.setFontStyle('normal');

  }

  /**
   * Adiciona o rodapé da impressão
   * @private
   */
  private addSaleFooter(): void {

    let currentYPos = this.halfPage ? this.doc.internal.pageSize.getHeight() - 23.5 : this.getYPos() + 10;
    let initialYPos = currentYPos;

    // Valores
    this.addFooterValue('PRODUTOS', NumbersHelper.formatCurrency(this.sale.productsTotal), currentYPos);
    currentYPos += 4;

    if (this.sale.shipping) {
      this.addFooterValue('FRETE', NumbersHelper.formatCurrency(this.sale.shipping), currentYPos);
      currentYPos += 4;
    }

    if (this.sale.discount) {
      this.addFooterValue('DESCONTO', NumbersHelper.formatCurrency(this.sale.discount), currentYPos);
      currentYPos += 6;
    }

    this.addFooterValue('TOTAL GERAL', NumbersHelper.formatCurrency(this.sale.saleTotal), currentYPos, 10, 12);

    // Assinaturas
    if (!this.quote && this.sale.customer) {
      this.addSignatureField('CLIENTE', initialYPos, 10);
      initialYPos += 8;
    }

    // Observação da impressão da venda
    if (this.sale.print.saleObservation) {

      this.doc.setFontSize(8);
      this.doc.text(this.sale.print.saleObservation, 10, initialYPos, {maxWidth: 130});

    }

  }

  /**
   * Adiciona um valor da venda ao rodapé
   * @param label A label do valor
   * @param value O valor formatado em R$
   * @param yPos A posição no eixo Y
   * @param labelSize O tamanho da fonte da label
   * @param valueSize O tamanho da fonte do valor
   * @private
   */
  private addFooterValue(label: string, value: string, yPos: number, labelSize = 8, valueSize?: number): void {

    const currentFontSize = this.doc.getFontSize();

    this.setFontStyle('bold');
    if (valueSize) {
      this.doc.setFontSize(valueSize);
    }
    this.doc.text(value, this.maxXPos(), yPos, {align: 'right'});
    const valueWidth = this.doc.getTextWidth(value);
    this.setFontStyle('normal');
    this.doc.text(label.concat(':  '), this.maxXPos() - valueWidth, yPos, {align: 'right'});
    this.doc.setFontSize(currentFontSize);

  }

  /**
   * Adiciona um campo de assinatura
   * @param label Label do campo
   * @param yPos Posição Y
   * @param xPos Posição X
   * @private
   */
  private addSignatureField(label: string, yPos: number, xPos: number): void {

    this.doc.setDrawColor('#000000');
    this.doc.setFillColor('#000000');
    this.doc.line(xPos, yPos, xPos + 70, yPos);
    this.doc.setFontSize(6);
    this.doc.text(label, xPos, yPos + 3);

  }

}

// noinspection SpellCheckingInspection
export const PHONE_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAIAAADeJhTwAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGlElEQVR4nO2dsXWrPBSAif8mnSjTQSYw6V4HG8AGeANnA7IB2QBnAsgEyBMgTwCeANOl4z+OEkIcbIMQSOD7Ve+dExvB53uvEJK4K8tS+SbLsiiKMMaHw0HhiqqqzieqqvL95llRfuN53tDnhRDyfb8EzvAlw3Xd0X5hruuCjUaUcWLihDAMJbwWwrlL0/Tx8XFkGZqmZVk28kHlZxFF0fiN3O/3Qo4rOQuMsZAWEkImdJnGYcG9Fwsws4BLJw/CZEAB/wvIkAhIUxIBMiRioev6rV8DaRAmA+4z/iIsTRVFIerQ0gI1QyJE1gxRIzHSAgVcIkSmKYiMExaGYYg6NoxRnrAQOEMAercnHGeH6Lq+3++FHL4+NwU41gyBNRyGC+sIlgGZqo5gGdChqnOUIbBDBZFRZ0HnXoo6/Ha7FXVoCTnKsCxLYMMgU1V83YFrmiaqBTCBquJLhsCyAZFRIV7GbreDuw3KlwyxZQMyFUV8ZECmqvhZuSRwhAoGqSg/zzPEZqqbR/klQ2ymunkUiAy5+BUZCCEhjbNtW8ZrMzq/noGLCo7n52chx5WNXzIcxxm/eev1GjLkF/UVnmmajnx0WIZcRzn5/3K5BBOiOJ03NVrGcF13s9mMc6zJcPIjSJJkhJZDTDRyKqMsy6GfbYCJczRM7xw0U0F2ukCDjOE6uGDiCo0RM0Smgux0leZZ6NyDA2KiFY22+PapICZa0iyDY6YCE+05u1iGy+AdZKdunNOW53nPb4aY6MpZGT03LgQTDFySEccxmBiTSzLYBnHBBDNXVrsylPGXl5euHwEod1cnLKmq2mlrCehBMXN9HXjX4Hh7e4MlMGxcj4zD4aDreqfgME0TZmwycD0yVFXtGhzb7RZkMHA9MtiCA/Z0ZuC/Np2f+/v7j4+PTuvvqDmYg9OJVpHBFhwIIUII7NrTnra76jBUjqIoYKpgJ9pGBltw0LczCJmoOEU67DfFEByKoqxWK9jKqCUdIoPCsMDJtm1YtdeGzjuxvb6+dv3I+/s7yGhD58igHdau20wghLIsg1eRXYZlj0KG4CiKAsr4VVrd9J3w8PDAsAfLfr9XVfXfv3/8T2IusKQp2s01DINhqXKSJLCS8xyMW6mqqsr20MKyLOjpnoN9X1vLshgWRkLxuESfZ7Z5nrMtkIXn5I30klGWZRiGbD+CIAgGOqXp0ldGn+lVcRzf7HVvhIOMPM/ZJuYihJIkGeKsJgpj1/YEQsjT0xObD7gzr+DzlgDDMNhenVwUBXR2f+AY0KZpsrVhuVzmeX5TGakRnjKYiwf4oPCU0XPJE/jgLKMsyyAIwAcb/GWUZbler8EHA4PI6FPMZfARx7HrutVID0LIdd0gCIZu1VAy8jzvs0GPQB+Xw9o0Td/3B7pXHUoG3b2qzz57Qu7P2w/tIIRs2/Y8L45jXr8bPnfg5yCEWJbF/OZQhFAURaPNEV2tVm9vb2yf1TRN13XLsvQaXb9kWBl9RkoqgiBYrVZ8W/WXPibOgRCqHmtSRfU/dBzn9KEnl/i6TJ/OLmXo5x991vX2QdO0MAyrZowhg4uP4Uq6KBMV1aOdkWRw8YEQ4v4IRLgJCo2P8WRw8aEoiud5vNojiQn6OztuScHrxFrCxYdpmmma9myJPCYoxyszmoYKLj4QQvXS1xXZTNBOigAZvHzQ+e0MVV1CEzTcxcigg+1c9sHvGiJymhAsg6MPGiJtqoi0JsTLoONXvDb8Rghd7mjJbEIKGXR8t894+wmapjXei0huQhYZlD7PoxpPrD7iK78JuWRw7GJVuK6bpukkTEgng5Z0gW+ZFYtpmnwmsfHCMAxCCMcSMi3kkkGX4WCM2eYnTh4JklMzt5aypEtTdWjKmkr55YK8MqqVg2EYinqB4MhILYPiOE6WZbfwYsUJyKAhEkVRHMfzriLTkEGxLIsQMueOlowdqWskSTK/exGpe1MXMAwDYxyG4cyy1iRlUGhh9zxvPn0tuRNSK/I8n4ES6QYK+zB1JbOSQZmukhnKoExRyWxlVARBMOZLtfswfxkUuiwMZEhEnue+70t7a2Ka5uCLZSSEELLZbKIoYtjWbzhuVEZF9AnGWAYrtm3ftIwKGisY491uJ6oNvu+DjF9kWYYxpuHCvC6UjTRNb6iAdyVJEt/3XdcdoebTiakQGa04HA6EEIwx+YRvjalepgcyGMEYU0PZN2yGPM+rNt0GGTyhemjtqd7/Vf93haqqlmU5jlMtDlcU5X9j0vLRLTQlXwAAAABJRU5ErkJggg==';
