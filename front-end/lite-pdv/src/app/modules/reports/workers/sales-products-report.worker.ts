/// <reference lib="webworker" />
import {SalesProductsReportBuilder} from '../components/sales-products-report/sales-products-report-builder';

addEventListener('message', ({data}) => {

  // Cria o relatório em PDF e emite a URL no método postMessage nativo do Web Worker
  const fileURL = SalesProductsReportBuilder.createSalesProductReportPDF(data[0], data[1]);
  postMessage(fileURL);

});
