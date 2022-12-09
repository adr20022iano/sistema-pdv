import {CashBookReportResponse} from '../../models/cash-book/cash-book-report-response';
import {CashBookReportSettings} from '../../models/cash-book/cash-book-report-settings';
import {DateHelper} from '../../../shared/helpers/date-helper';
import {PdfReportHelper} from '../../../shared/helpers/pdf-report-helper';
import {UserOptions} from 'jspdf-autotable';
import {PdfTableColumn} from '../../../shared/helpers/new-pdf-helper';

export class CashBookReportBuilder {

  /**
   * Cria o pdf do relatório dos lançamentos do caixa.
   * @param response Resposta do relatório retornada pelo webservice.
   * @param settings Configurações do relatório.
   * @private
   */
  public static createCashBookReport(response: CashBookReportResponse, settings: CashBookReportSettings): string {

    // Dados do cabeçalho do relatório
    const title = 'Relatório de Caixa'.concat(' - ',
      DateHelper.dateToFormattedString(new Date(), 'dd/MM/yyyy HH:mm'));
    const typeLabel = 'Categoria(s) selecionada(s): '.concat(settings.selectedCategories);

    // Inicializa o helper que cria o arquivo PDF
    const reportHelper = new PdfReportHelper();
    reportHelper.addReportHeader(title, typeLabel, settings.startDate, settings.endDate);

    reportHelper.addTable({
      ...this.getCashBookReportTable(response, settings),
      startY: reportHelper.getYPos()
    });

    return reportHelper.getFileURL();

  }

  /**
   * Retorna a tabela do relatório de caixa.
   * @param response A resposta da consulta do relatório.
   * @param settings As configurações do relatório.
   * @private
   */
  private static getCashBookReportTable(response: CashBookReportResponse, settings: CashBookReportSettings): UserOptions {

    // Definição das colunas da tabela
    const columnsDef: PdfTableColumn[] = [
      {header: 'Código', dataKey: 'code'},
      {header: 'Histórico', dataKey: 'history'},
      {header: 'Data', dataKey: 'date'},
      {header: 'Categoria', dataKey: 'categoryName'},
      {header: 'Valor', dataKey: 'value'},
    ];

    // Estilos de customização das colunas
    const columnStyles = {
      code: {
        halign: 'center'
      },
      date: {
        halign: 'center'
      },
      value: {
        halign: 'right'
      }
    } as const;

    // Definição do footer da tabela
    const footerDef = [
      [
        {
          content: 'Total',
          colSpan: 4,
          styles: {halign: 'right'} as const,
        },
        {
          content: response.data.totalValue,
          styles: {halign: 'right'} as const
        },
        {
          content: '',
          styles: {halign: 'right'} as const
        }
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
