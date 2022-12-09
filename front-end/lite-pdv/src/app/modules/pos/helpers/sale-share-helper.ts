// import {PdfHelper, PdfTableColumn, PdfTableColumnStyles} from '../../shared/helpers/pdf-helper';
// import {SaleForPrint} from '../models/sale-for-print';
// import {UserOptions} from 'jspdf-autotable';
// import {NumbersHelper} from '../../shared/helpers/numbers-helper';
// import {SHARE_FACEBOOK, SHARE_INSTAGRAM, SHARE_LOGO, SHARE_PHONE} from '../../../../assets/images/print-images';
// import {DateHelper} from '../../shared/helpers/date-helper';
// import {SaleProduct} from '../models/sale-product';
//
// export class SaleShareHelper extends PdfHelper {
//
//   /** A largura máxima do documento */
//   private readonly pageWidth: number;
//
//   constructor(private sale: SaleForPrint, private isQuote?: boolean) {
//
//     super('p', 'a4');
//     this.pageWidth = this.maxXPos() + 10;
//     this.addCompanyDetails();
//     this.addSaleDetails();
//     this.addProducts();
//     this.addFooter();
//
//   }
//
//   /**
//    * Cria a tabela dos produtos para impressão.
//    * @param saleForPrint A venda retornada pelo webservice.
//    * @private
//    */
//   private static getProductsTable(saleForPrint: SaleForPrint): UserOptions {
//
//     // Definição das colunas da tabela
//     const productsColumnDef: PdfTableColumn[] = [
//       {header: 'Código', dataKey: 'code'},
//       {header: 'Produto', dataKey: 'name'},
//       {header: 'Quantidade', dataKey: 'quantity'},
//       {header: 'Unitário', dataKey: 'value'},
//       {header: 'Total', dataKey: 'subtotal'}
//     ];
//
//     const productsColumnStyles: PdfTableColumnStyles = {
//       code: {valign: 'middle'},
//       value: {halign: 'right', valign: 'middle'},
//       subtotal: {halign: 'right', valign: 'middle'},
//       quantity: {halign: 'right', valign: 'middle'}
//     };
//
//     // Formata os valores dos produtos
//     const products = saleForPrint.products.map(product => {
//       return {
//         ...product,
//         value: NumbersHelper.formatCurrency(product.value),
//         subtotal: NumbersHelper.formatCurrency(product.subtotal),
//         quantity: product.quantity.toString().concat(' ', product.unit)
//       };
//     });
//
//     return {
//       columns: productsColumnDef,
//       columnStyles: productsColumnStyles,
//       styles: {textColor: '#000000', fillColor: false},
//       headStyles: {textColor: '#2196F3', fontSize: 10, fillColor: false},
//       bodyStyles: {fillColor: false, minCellHeight: 8, valign: 'middle'},
//       body: products
//     };
//
//   }
//
//   /**
//    * Adiciona o cabeçalho de venda no documento.
//    * @private
//    */
//   private addCompanyDetails(): void {
//
//     // Background
//     this.doc.setFillColor('#0033C4');
//     this.doc.rect(0, 0, this.doc.internal.pageSize.getWidth(), 42, 'F');
//     this.doc.setFillColor('#FFFFFF');
//
//     // Logo
//     this.doc.addImage(SHARE_LOGO, 10, 14, 35, 10, 'logo');
//
//     // Nome empresa
//     this.doc.setFontSize(20);
//     this.doc.setTextColor('#FFFFFF');
//     this.doc.text('IVAN FERRAGENS', this.maxXPos(), 15, {align: 'right'});
//
//     // Endereço
//     this.doc.setFontSize(12);
//     this.doc.text('Av. Joaquim Três Pontas, 1075'.toUpperCase(), this.maxXPos(), 21.5, {align: 'right'});
//     this.doc.text('Boa Esperança - MG'.toUpperCase(), this.maxXPos(), 26.5, {align: 'right'});
//
//   }
//
//   /**
//    * Adiciona os detalhes da venda
//    * @private
//    */
//   private addSaleDetails(): void {
//
//     let currentYPos = 52;
//     this.doc.setTextColor('#000000');
//     this.doc.setFontSize(14);
//
//     // Cliente
//     const customer = this.sale.customer;
//     const customerName = customer ? customer.code.toString().concat(' • ', customer.name, ' (', customer.nickname, ')') : 'Cliente não informado';
//     this.addHeaderInfo('Cliente', customerName, currentYPos);
//
//     // Código da venda/orçamento
//     const saleLabel = this.isQuote ? 'Nº Orçamento' : 'Nº Venda';
//     this.addHeaderInfo(saleLabel, this.sale.code.toString(), currentYPos, true);
//     currentYPos += 13;
//
//     this.addHeaderInfo('Forma de pagamento', this.sale.paymentMethodName, currentYPos);
//     this.addHeaderInfo('Data', DateHelper.dateToFormattedString(new Date(this.sale.date), 'dd/MM/yy • HH:mm:ss'), currentYPos, true);
//     currentYPos += 13;
//
//     if (this.sale.observation) {
//       this.addHeaderInfo('Observação', this.sale.observation, currentYPos);
//       currentYPos += 13;
//     }
//
//     this.setYPos(currentYPos + 4);
//
//   }
//
//   /**
//    * Adiciona uma das labels de informação do cabeçalho
//    * @param label
//    * @param text
//    * @param startYPos
//    * @param rightAlign
//    * @private
//    */
//   private addHeaderInfo(label: string, text: string, startYPos: number, rightAlign?: boolean): void {
//
//     this.doc.setFontSize(14);
//     this.setFontStyle('bold');
//     const maxXPos = this.maxXPos();
//     this.doc.text(label, rightAlign ? maxXPos : 10, startYPos, rightAlign ? {align: 'right'} : null);
//     this.setFontStyle('normal');
//     this.doc.setFontSize(12);
//     this.doc.text(text, rightAlign ? maxXPos : 10, startYPos + 6, rightAlign ? {align: 'right'} : null);
//
//   }
//
//   /**
//    * Adiciona o footer do compartilhamento.
//    * @private
//    */
//   private addFooter(): void {
//
//     this.doc.setFillColor('#0033C4');
//     const pageHeight = this.doc.internal.pageSize.getHeight();
//     const pageWidth = this.doc.internal.pageSize.getWidth();
//     this.doc.rect(0, pageHeight - 42, pageWidth, 42, 'F');
//     this.doc.setFillColor('#FFFFFF');
//
//     this.doc.setFontSize(14);
//     this.doc.setTextColor('#FFFFFF');
//
//     let textStart = pageHeight - 34;
//     this.doc.text('Total dos Produtos: '.concat(NumbersHelper.formatCurrency(this.sale.productsTotal)), this.maxXPos(), textStart, {
//       align: 'right',
//       baseline: 'hanging'
//     });
//
//     textStart += 7;
//     this.doc.text('Frete: '.concat(NumbersHelper.formatCurrency(this.sale.shipping)), this.maxXPos(), textStart, {
//       align: 'right',
//       baseline: 'hanging'
//     });
//
//     textStart += 7;
//     this.doc.text('Desconto: '.concat(NumbersHelper.formatCurrency(this.sale.discount)), this.maxXPos(), textStart, {
//       align: 'right',
//       baseline: 'hanging'
//     });
//
//     this.doc.setFontSize(20);
//     textStart += 8;
//     this.doc.text('TOTAL GERAL: '.concat(NumbersHelper.formatCurrency(this.sale.value)), this.maxXPos(), textStart, {
//       align: 'right',
//       baseline: 'hanging'
//     });
//
//     // Contatos
//     this.doc.setFontSize(12);
//     this.doc.addImage(SHARE_PHONE, 10, pageHeight - 34, 5, 5, 'phone_icon');
//     this.doc.text('(35) 3851-7623', 18, pageHeight - 34, {baseline: 'hanging'});
//
//     this.doc.addImage(SHARE_INSTAGRAM, 10, pageHeight - 24, 5, 5, 'insta_icon');
//     // noinspection SpellCheckingInspection
//     this.doc.text('@ivanferragens', 18, pageHeight - 23.5, {baseline: 'hanging'});
//
//     this.doc.addImage(SHARE_FACEBOOK, 10, pageHeight - 14, 5, 5, 'face_icon');
//     // noinspection SpellCheckingInspection
//     this.doc.text('ivanferragens', 18, pageHeight - 13.2, {baseline: 'hanging'});
//
//   }
//
//   /**
//    * Adiciona a tabela de produtos
//    * @private
//    */
//   private addProducts(): void {
//
//     this.addTable({
//       ...SaleShareHelper.getProductsTable(this.sale),
//       didParseCell: this.didParseCell,
//       didDrawCell: this.didDrawCell,
//       margin: {left: 10, right: 10, bottom: 42},
//       startY: this.getYPos()
//     });
//
//   }
//
//   /**
//    * Chamado antes de computar a largura da coluna e outros recursos.
//    * Use for customizing texts or styles of specific cells after they have been formatted.
//    * This hook is called just before the column width and other features are computed.
//    * @param cellData
//    */
//   private didParseCell = (cellData: any) => {
//
//     // Se o produto possui observação, limpamos o conteúdo da célula, para ele ser preenchido após ela ser desenhada
//     if (cellData.section === 'body' && cellData.column.dataKey === 'name' && cellData.row.raw.observation) {
//
//       cellData.cell.text = '';
//       // Também definimos a altura da linha
//       cellData.row.height = 8;
//
//     }
//
//     if (cellData.section === 'head' && (
//       cellData.column.dataKey === 'quantity' ||
//       cellData.column.dataKey === 'value' ||
//       cellData.column.dataKey === 'subtotal'
//     )) {
//       cellData.cell.styles.halign = 'right';
//     }
//
//   };
//
//   /**
//    * Usado para adicionar conteúdo nas células depois que elas são desenhadas.
//    * @param data
//    */
//   private didDrawCell = (data: any) => {
//
//     // Divisor de itens
//     if (data.section === 'body' && data.column.dataKey === 'subtotal') {
//       this.doc.setDrawColor('#000000');
//       this.doc.setLineWidth(.05);
//       this.doc.line(0, data.cell.y + data.row.height, this.pageWidth, data.cell.y + data.row.height);
//     }
//
//     // Se o produto tem observação, preenchemos o nome e a observação manualmente para poder definir tamanhos diferentes\
//     if (data.section === 'body' && data.column.dataKey === 'name') {
//
//       const product: SaleProduct = data.row.raw;
//       if (!product.observation) {
//         return;
//       }
//
//       this.doc.text(product.name, data.cell.x + 1.8, data.cell.y + 4);
//       this.doc.setFontSize(6);
//       this.doc.text('Obs.: '.concat(product.observation), data.cell.x + 1.8, data.cell.y + 6.5);
//       this.doc.setFontSize(8);
//
//     }
//
//   };
//
// }
