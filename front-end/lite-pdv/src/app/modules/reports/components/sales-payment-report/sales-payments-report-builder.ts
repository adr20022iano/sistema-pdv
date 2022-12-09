/**
 * Cria o pdf do relatório de vendas.
 * @param response Resposta do relatório retornada pelo webservice.
 * @param settings Configurações do relatório.
 * @private
 */
import {DateHelper} from '../../../shared/helpers/date-helper';
import {UserOptions} from 'jspdf-autotable';
import {PdfReportHelper} from '../../../shared/helpers/pdf-report-helper';
import {centerAlign, PdfTableColumn, rightAlign} from '../../../shared/helpers/new-pdf-helper';
import {SalesPaymentsReportResponse} from '../../models/sales-payments/sales-payments-report-response';
import {SalesPaymentsReportSettings} from '../../models/sales-payments/sales-payments-report-settings';
import {Customer} from '../../../customers/models/customer';

export class SalesPaymentsReportBuilder {

  /**
   * Cria o arquivo PDF do relatório e retorna a URL.
   * @param response Resposta da consulta do relatório.
   * @param settings As configurações do relatório.
   */
  public static createSalesPaymentReportPDF(response: SalesPaymentsReportResponse, settings: SalesPaymentsReportSettings): string {

    // Dados do cabeçalho do relatório
    const title = 'Relatório de Recebimentos '.concat(DateHelper.dateToFormattedString(new Date(), 'dd/MM/yyyy HH:mm'));
    const typeLabel = 'Tipo de recebimentos: '.concat(this.getTypeLabel(settings));

    // Se está filtrando um cliente ou não
    let customerFilter;
    const filteringCustomer = settings.customer?.code > 0;
    if (filteringCustomer) {
      customerFilter = this.getCustomerFilterLabel(settings.customer);
    }

    // Inicializa o helper que cria o arquivo PDF
    const reportHelper = new PdfReportHelper();
    reportHelper.addReportHeader(title, typeLabel, settings.startDate, settings.endDate, customerFilter);

    reportHelper.addTable({
      ...this.getSalesPaymentTable(response, settings, filteringCustomer),
      startY: reportHelper.getYPos(),
      margin: 10
    });

    return reportHelper.getFileURL();

  }

  /**
   * Monta a tabela de produtos do relatório
   * @param response Resposta da consulta do relatório
   * @param settings Configurações do relatório
   * @param filteringCustomer Se está filtrando um cliente ou não
   * @private
   */
  private static getSalesPaymentTable(response: SalesPaymentsReportResponse, settings: SalesPaymentsReportSettings,
                                      filteringCustomer: boolean): UserOptions {

    // Definição das colunas da tabela
    const columnsDef: PdfTableColumn[] = [
      {header: 'Tipo do pagamento', dataKey: 'type'},
      {header: 'Data', dataKey: 'date'},
      {header: 'Cód. venda', dataKey: 'saleCode'},
      {header: 'Valor', dataKey: 'value'}
    ];

    // Se não está filtrando um cliente específico, adiciona a coluna de clientes
    if (!filteringCustomer) {
      columnsDef.splice(3, 0, {header: 'Cliente', dataKey: 'customerName'});
    }

    // Definição do footer da tabela
    const footerDef = [
      [
        {
          content: 'Total recebido',
          colSpan: filteringCustomer ? 3 : 4,
          styles: centerAlign
        },
        {
          content: response.data.totalValue,
          styles: rightAlign
        },
      ],
    ];

    // Estilos de customização das colunas
    const columnStyles = {
      value: rightAlign
    };

    return {
      columns: columnsDef,
      columnStyles,
      body: response.list,
      foot: footerDef
    };

  }

  /**
   * Retorna a label do tipo de relatório
   */
  private static getTypeLabel(settings: SalesPaymentsReportSettings): string {

    switch (settings.type) {

      case 1:
        return 'Dinheiro - Cheque';

      case 2:
        return 'Cartão de crédito';

      case 3:
        return 'Cartão de débito';

      case 4:
        return 'Outros';

      default:
        return 'Todos';

    }

  }

  /**
   * Retorna a string de filtro do cliente.
   * @param customer O cliente selecionado para filtragem.
   * @private
   */
  private static getCustomerFilterLabel(customer: Customer): string {
    return 'Filtrando cliente: '.concat(customer.code.toString(), ' - ', customer.name);
  }

}
