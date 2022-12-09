import {SalesReportResponse} from '../../models/sales/sales-report-response';
import {SalesReportSettings} from '../../models/sales/sales-report-settings';
import {DateHelper} from '../../../shared/helpers/date-helper';
import {CellInput, UserOptions} from 'jspdf-autotable';
import {PdfReportHelper} from '../../../shared/helpers/pdf-report-helper';
import {centerAlign, PdfTableColumn, rightAlign} from '../../../shared/helpers/new-pdf-helper';
import {SALE_PAYMENT_STATUS} from '../../../pos/models/sale-payment-status.enum';

export class SalesReportPdfBuilder {

  /**
   * Cria o pdf do relatório de vendas.
   * @param response Resposta do relatório retornada pelo webservice.
   * @param settings Configurações do relatório.
   * @returns A url para exibição do relatório.
   * @private
   */
  public static createSalesReportPDF(response: SalesReportResponse, settings: SalesReportSettings): string {

    const title = 'Relatório de Vendas '.concat(DateHelper.dateToFormattedString(new Date(), 'dd/MM/yyyy HH:mm'));
    const paymentStatusLabel = 'Status do pagamento: '.concat(settings.paymentStatusLabel || 'Todos');

    // Label do filtro
    const filterLabel = this.getFilterLabel(settings);

    // Inicializa o helper que cria o arquivo PDF
    const reportHelper = new PdfReportHelper();
    reportHelper.addReportHeader(title, paymentStatusLabel, settings.startDate, settings.endDate, filterLabel);

    const table = this.createSalesReportTable(response, settings);
    reportHelper.addTable({
      ...table,
      startY: reportHelper.getYPos()
    });

    reportHelper.addTable({
      ...this.getReportFooter(response),
      startY: reportHelper.getYPos() + 4
    });

    if (settings.showProfit) {
      reportHelper.addTable({
        ...PdfReportHelper.getReportProfitFooter(response),
        startY: reportHelper.getYPos() + 4
      });
    }

    reportHelper.getDoc().text('Valor total a receber = Valor não recebido dos pedidos listados.', 10, reportHelper.getYPos() + 4);
    reportHelper.getDoc().text('Recebimento de vendas a prazo = Valores recebidos no intervalo de data do relatório de pedidos que não fazem parte do período.', 10, reportHelper.getYPos() + 8);

    return reportHelper.getFileURL();

  }

  /**
   * Retorna o filtro do relatório
   * @private
   */
  private static getFilterLabel(settings: SalesReportSettings): string {

    let filterLabel = '';

    if (settings.customer?.code > 0) {
      filterLabel = filterLabel.concat('Cliente: ', settings.customer.code.toString(), ' - ', settings.customer.name);
    }

    return filterLabel;
  }

  /**
   * Cria a tabela do relatório de vendas.
   * @param response A resposta da consulta do relatório.
   * @param settings As configurações do relatório.
   * @private
   */
  private static createSalesReportTable(response: SalesReportResponse, settings: SalesReportSettings): UserOptions {

    // Definição das colunas da tabela
    const columnsDef: PdfTableColumn[] = [
      {header: 'Código', dataKey: 'code'},
      {header: 'Data', dataKey: 'date'},
      {header: 'Dinheiro', dataKey: 'cash'},
      {header: 'Crédito', dataKey: 'credit'},
      {header: 'Débito', dataKey: 'debit'},
      {header: 'Outros', dataKey: 'others'},
      {header: 'Troco', dataKey: 'saleChange'},
      {header: 'Valor da venda', dataKey: 'value'},
      {header: 'Frete', dataKey: 'shipping'},
      {header: 'Desconto', dataKey: 'discount'},
      {header: 'Pago', dataKey: 'paidValue'},
      {header: 'Restante', dataKey: 'unpaidValue'},
      {header: 'Custo dos produtos', dataKey: 'productsCost'},
      {header: 'Lucro bruto • margem • markup', dataKey: 'profit'},
      {header: 'Cliente', dataKey: 'customerName'},
    ];

    // Remove os itens conforme as configurações de exibição
    if (!settings.showSaleDate) {
      const index = columnsDef.findIndex(item => item.dataKey === 'date');
      columnsDef.splice(index, 1);
    }

    // Remove as colunas de de total pago e restante
    if (settings.paymentStatus !== SALE_PAYMENT_STATUS.PARTIALLY_OR_NOT_PAID) {

      const index = columnsDef.findIndex(item => item.dataKey === 'paidValue');
      columnsDef.splice(index, 2);

    }

    if (!settings.showProductsCost) {
      const index = columnsDef.findIndex(item => item.dataKey === 'productsCost');
      columnsDef.splice(index, 1);
    }

    if (!settings.showSaleProfit) {
      const index = columnsDef.findIndex(item => item.dataKey === 'profit');
      columnsDef.splice(index, 1);
    }

    if (!settings.showCustomerColumn || settings.customer?.code > 0) {
      const index = columnsDef.findIndex(item => item.dataKey === 'customerName');
      columnsDef.splice(index, 1);
    }

    // Estilos de customização das colunas
    const columnStyles = {
      code: centerAlign,
      date: {...centerAlign, minCellWidth: 25},
      value: rightAlign,
      cash: rightAlign,
      credit: rightAlign,
      debit: rightAlign,
      others: rightAlign,
      saleChange: rightAlign,
      paidValue: rightAlign,
      productsCost: rightAlign,
      discount: rightAlign,
      shipping: rightAlign,
      profit: centerAlign
    };

    const numberOfOrders = response.list.length;
    const orderLabels = numberOfOrders === 1 ? 'Pedido' : 'Pedidos';

    // Definição do footer da tabela
    const footerCells: CellInput[] = [
      {
        content: numberOfOrders.toString().concat(' ', orderLabels),
        colSpan: settings.showSaleDate ? 2 : 1,
        styles: {halign: 'center'}
      },
      {
        content: response.data.totalPaidCash,
        styles: {halign: 'right'} as const
      },
      {
        content: response.data.totalPaidCredit,
        styles: {halign: 'right'} as const
      },
      {
        content: response.data.totalPaidDebit,
        styles: {halign: 'right'} as const
      },
      {
        content: response.data.totalPaidOthers,
        styles: {halign: 'right'} as const
      },
      {
        content: '',
      },
      {
        content: response.data.totalSaleValue,
        styles: {halign: 'right'} as const
      },
      {
        content: response.data.totalShipping,
        styles: {halign: 'right'} as const
      },
      {
        content: response.data.totalDiscount,
        styles: {halign: 'right'} as const
      },
      {
        content: settings.showProductsCost ? response.data.totalProductsCost : '',
        styles: {halign: 'right'} as const
      },
      {
        content: '',
      }
    ];

    // Adiciona as colunas de total pago e restante
    if (settings.paymentStatus === SALE_PAYMENT_STATUS.PARTIALLY_OR_NOT_PAID) {

      const extrasCells: CellInput[] = [
        {
          content: response.data.totalPaidValue,
          styles: {halign: 'right'} as const
        },
        {
          content: response.data.totalUnpaidValue,
          styles: {halign: 'right'} as const
        }
      ];

      footerCells.splice(9, 0, ...extrasCells);

    }

    return {
      columns: columnsDef,
      columnStyles,
      body: response.list,
      foot: [footerCells]
    };

  }

  /**
   * Retorna a tabela de header da venda
   * @param response A resposta do relatório
   * @private
   */
  private static getReportFooter(response: SalesReportResponse): UserOptions {

    return {
      body: [
        [
          {content: 'Número de pedidos', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}},
          {content: 'Valor total a receber', styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}},
          {
            content: 'Recebimento de vendas a prazo',
            styles: {fontStyle: 'bold', halign: 'center', fillColor: '#ebebeb'}
          }
        ],
        [
          {content: response.list.length, styles: {fontStyle: 'bold', halign: 'right'}},
          {content: response.data.totalUnpaidValue, styles: {fontStyle: 'bold', halign: 'right'}},
          {content: response.data.paymentsReceived, styles: {fontStyle: 'bold', halign: 'right'}},
        ]
      ]
    };

  }

}
