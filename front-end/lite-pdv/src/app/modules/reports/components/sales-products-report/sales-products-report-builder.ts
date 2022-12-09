/**
 * Cria o pdf do relatório de vendas.
 * @param response Resposta do relatório retornada pelo webservice.
 * @param settings Configurações do relatório.
 * @private
 */
import {SalesProductsReportResponse} from '../../models/sale-products/sales-products-report-response';
import {SalesProductsReportSettings} from '../../models/sale-products/sales-products-report-settings';
import {DateHelper} from '../../../shared/helpers/date-helper';
import {UserOptions} from 'jspdf-autotable';
import {PdfReportHelper} from '../../../shared/helpers/pdf-report-helper';
import {centerAlign, PdfTableColumn, rightAlign} from '../../../shared/helpers/new-pdf-helper';

export class SalesProductsReportBuilder {

  /**
   * Cria o arquivo PDF do relatório e retorna a URL.
   * @param response Resposta da consulta do relatório.
   * @param settings As configurações do relatório.
   */
  public static createSalesProductReportPDF(response: SalesProductsReportResponse, settings: SalesProductsReportSettings): string {

    const title = 'Relatório de Produtos Vendidos '.concat(DateHelper.dateToFormattedString(new Date(), 'dd/MM/yyyy HH:mm'));

    // Label do filtro
    const filterLabel = this.getFilterLabel(settings);

    // Inicializa o helper que cria o arquivo PDF
    const reportHelper = new PdfReportHelper();
    reportHelper.addReportHeader(title, null, settings.startDate, settings.endDate, filterLabel);

    reportHelper.addTable({
      ...this.getSalesProductsTable(response, settings),
      startY: reportHelper.getYPos(),
      margin: 10
    });

    if (settings.showProfit) {
      reportHelper.addTable({
        ...PdfReportHelper.getReportProfitFooter(response),
        startY: reportHelper.getYPos() + 4
      });
    }

    return reportHelper.getFileURL();

  }

  /**
   * Monta a tabela de produtos do relatório
   * @param response Resposta da consulta do relatório
   * @param settings Configurações do relatório
   * @private
   */
  private static getSalesProductsTable(response: SalesProductsReportResponse, settings: SalesProductsReportSettings): UserOptions {

    // Definição das colunas da tabela
    const columnsDef: PdfTableColumn[] = [
      {header: 'Código', dataKey: 'code'},
      {header: 'Nome', dataKey: 'name'},
      {header: 'Código de barras', dataKey: 'barCode'},
      {header: 'Quantidade', dataKey: 'quantity'},
      {header: 'Valor', dataKey: 'value'},
      {header: 'Custo', dataKey: 'cost'},
      {header: 'Lucro bruto • margem • markup', dataKey: 'profit'},
    ];

    if (!settings.showProductsCost) {
      const index = columnsDef.findIndex(item => item.dataKey === 'cost');
      columnsDef.splice(index, 1);
    }

    if (!settings.showProductsProfit) {
      const index = columnsDef.findIndex(item => item.dataKey === 'profit');
      columnsDef.splice(index, 1);
    }

    if (!settings.showBarCode) {
      const index = columnsDef.findIndex(item => item.dataKey === 'barCode');
      columnsDef.splice(index, 1);
    }

    const numberOfProducts = response.list.length;
    const totalLabel = numberOfProducts === 1 ? 'Produto' : 'Produtos';

    // Definição do footer da tabela
    const footerDef = [
      [
        {
          content: numberOfProducts.toString().concat(' ', totalLabel),
          colSpan: 2,
          styles: {halign: 'center'} as const,
        },
        {
          content: response.data.total,
          styles: {halign: 'right'} as const,
          colSpan: settings.showBarCode ? 2 : 1
        },
        {
          content: response.data.totalSaleValue,
          styles: {halign: 'right'} as const
        },
        {
          content: settings.showProductsCost ? response.data.totalProductsCost : '',
          styles: {halign: 'right'} as const
        }
      ]
    ];

    // Estilos de customização das colunas
    const columnStyles = {
      code: centerAlign,
      value: rightAlign,
      barCode: centerAlign,
      quantity: rightAlign,
      cost: rightAlign,
      profit: centerAlign
    };

    return {
      columns: columnsDef,
      columnStyles,
      body: response.list,
      foot: footerDef
    };

  }

  /**
   * Retorna a label de filtro do relatório
   * @param settings
   * @private
   */
  private static getFilterLabel(settings: SalesProductsReportSettings): string {

    let label = '';

    if (settings.customer?.code > 0) {
      label = label.concat('Cliente: ', settings.customer.code.toString(), ' - ', settings.customer.name);
    }

    if (settings.seller) {
      label = label.concat(label ? ' - ' : '', 'Vendedor: ', settings.seller);
    }

    return label;
  }

}
