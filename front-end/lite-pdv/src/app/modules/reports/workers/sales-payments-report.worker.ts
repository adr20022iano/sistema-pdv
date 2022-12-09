/// <reference lib="webworker" />
import {SalesPaymentsReportBuilder} from '../components/sales-payment-report/sales-payments-report-builder';

addEventListener('message', ({data}) => {

  // Cria o relatório em PDF e emite a URL no método postMessage nativo do Web Worker
  const fileURL = SalesPaymentsReportBuilder.createSalesPaymentReportPDF(data[0], data[1]);
  postMessage(fileURL);

});
