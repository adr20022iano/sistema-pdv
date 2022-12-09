import {DateHelper} from './date-helper';
import {UserOptions} from 'jspdf-autotable';
import {ProductsReportResponse} from '../../reports/models/products/products-report-response';
import {SalesReportResponse} from '../../reports/models/sales/sales-report-response';
import {NewPdfHelper} from './new-pdf-helper';
import {jsPDF} from 'jspdf';
import {SalesProductsReportResponse} from '../../reports/models/sale-products/sales-products-report-response';

export class PdfReportHelper extends NewPdfHelper {

  constructor(orientation: 'p' | 'l' = 'l') {
    super(orientation, 'a4');
  }

  /**
   * Retorna a tabela de lucro de um relatório
   * @param response A resposta do relatório
   * @private
   */
  public static getReportProfitFooter(response: SalesProductsReportResponse | ProductsReportResponse | SalesReportResponse): UserOptions {

    return {
      body: [
        [
          {content: 'Total de lucro bruto', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}},
          {content: 'Margem de lucro Total', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}},
          {
            content: 'Markup total',
            styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}
          }
        ],
        [
          {content: response.data.profitValue, styles: {fontStyle: 'bold', halign: 'right'}},
          {content: response.data.profitMargin, styles: {fontStyle: 'bold', halign: 'right'}},
          {content: response.data.profitMarkup, styles: {fontStyle: 'bold', halign: 'right'}},
        ]
      ]
    };

  }

  /**
   * Adiciona o título o relatório
   * @param title O título do relatório.
   * @param subTitle O subtítulo do relatório.
   * @param startDate Data inicial do filtro do relatório.
   * @param endDate Data final do filtro do relatório.
   * @param filterLabel Label exibida logo abaixo do título.
   */
  public addReportHeader(title: string, subTitle?: string, startDate?: Date, endDate?: Date, filterLabel?: string) {

    // Inicializando e determinando parâmetros do documento PDF
    let startingYPos = this.getYPos();
    this.doc.setProperties({title, creator: 'Devap PDV'});
    this.doc.setFontSize(12);
    this.doc.text(title, 10, startingYPos);
    this.doc.setFontSize(8);

    if (filterLabel) {
      startingYPos += 4;
      this.doc.text(filterLabel, 10, startingYPos);
    }

    if (subTitle) {
      startingYPos += 4;
      this.doc.text(subTitle, 10, startingYPos);
    }

    if (startDate && endDate) {
      startingYPos += 4;
      this.doc.text('Período: '.concat(DateHelper.dateToFormattedString(startDate, 'dd/MM/yyyy'), ' - ',
        DateHelper.dateToFormattedString(endDate, 'dd/MM/yyyy')), 10, startingYPos);
    }

    this.setYPos(startingYPos + 4);

  }

  /**
   * Retorna o documento associado ao helper.
   */
  public getDoc(): jsPDF {
    return this.doc;
  }

}
