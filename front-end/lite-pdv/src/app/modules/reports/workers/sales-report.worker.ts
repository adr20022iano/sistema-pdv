/// <reference lib="webworker" />
import {SalesReportPdfBuilder} from '../components/sales-report/sales-report-pdf-builder';

addEventListener('message', ({data}) => {

  // Cria o relatório em PDF e emite a URL no método postMessage nativo do Web Worker
  const fileURL = SalesReportPdfBuilder.createSalesReportPDF(data[0], data[1]);
  postMessage(fileURL);

});
