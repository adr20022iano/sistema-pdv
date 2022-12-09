import {StockHandlingReportResponse} from '../../models/stock-handling/stock-handling-report-response';
import {StockHandlingReportSettings} from '../../models/stock-handling/stock-handling-report-settings';
import {DateHelper} from '../../../shared/helpers/date-helper';
import {UserOptions} from 'jspdf-autotable';
import {PdfTableColumn} from '../../../shared/helpers/new-pdf-helper';
import {PdfReportHelper} from '../../../shared/helpers/pdf-report-helper';

export class StockHandlingReportBuilder {

  /**
   * Cria o pdf do relatório de pagamentos de uma venda.
   * @param response Resposta do relatório retornada pelo webservice.
   * @param settings Configurações do relatório.
   * @private
   */
  public static createStockHandlingReportPDF(response: StockHandlingReportResponse, settings: StockHandlingReportSettings): string {

    // Dados do cabeçalho do relatório
    const title = 'Relatório de Movimentações de Estoque '.concat(DateHelper.dateToFormattedString(new Date(), 'dd/MM/yyyy HH:mm'));
    const operationsLabel = 'Operações selecionadas: '.concat(settings.handlingOperations);

    // Se está filtrando um produto ou não
    let productFilter;
    if (settings.product) {
      productFilter = 'Filtrando produto: '.concat(settings.product.code.toString(), ' - ', settings.product.name);
    }

    // Inicializa o helper que cria o arquivo PDF
    const reportHelper = new PdfReportHelper();
    reportHelper.addReportHeader(title, operationsLabel, settings.startDate, settings.endDate, productFilter);

    reportHelper.addTable({
      ...this.getStockHandlingReportTable(response, settings),
      startY: reportHelper.getYPos()
    });
    return reportHelper.getFileURL();

  }

  /**
   * Cria a tabela do relatório de movimentações de estoque
   * @param response A resposta da consulta do relatório
   * @param settings As configurações do relatório
   * @private
   */
  private static getStockHandlingReportTable(response: StockHandlingReportResponse, settings: StockHandlingReportSettings): UserOptions {

    // Definição das colunas da tabela
    const columnsDef: PdfTableColumn[] = [
      {header: 'Histórico', dataKey: 'history'},
      {header: 'Quantidade', dataKey: 'quantity'},
      {header: 'Tipo', dataKey: 'type'},
      {header: 'Data', dataKey: 'date'},
    ];

    // Se não está filtrando um produto específico, adiciona os dados do produto
    if (!settings.product) {
      columnsDef.splice(0, 0, {header: 'Código', dataKey: 'code'});
      columnsDef.splice(1, 0, {header: 'Produto', dataKey: 'name'});
    }

    // Adiciona as colunas de acordo com os relatórios específicos
    if (settings.handlingOperations === 'Entradas') {
      columnsDef.push({header: 'Custo informado', dataKey: 'cost'});
      columnsDef.push({header: 'Custo anterior', dataKey: 'oldCost'});
    } else if (settings.handlingOperations === 'Vendas') {
      columnsDef.push({header: 'Vendas sem descontos', dataKey: 'saleValue'});
    }

    // Estilos de customização das colunas
    const columnStyles = {
      quantity: {
        halign: 'right'
      },
      code: {
        halign: 'center'
      },
      cost: {
        halign: 'right'
      },
      oldCost: {
        halign: 'right'
      },
      saleValue: {
        halign: 'right'
      }
    } as const;

    const quantityIndex = columnsDef.findIndex(column => column.dataKey === 'quantity');

    // Definição do footer da tabela
    const footerDef = [
      [
        {
          content: response.list.length.toString().concat(' movimentações'),
          colSpan: quantityIndex
        },
        {
          content: response.data?.total || '0',
          styles: {halign: 'right'} as const
        },
      ]
    ];

    return {
      columns: columnsDef,
      columnStyles,
      body: response.list,
      foot: footerDef
    };

  }

}
