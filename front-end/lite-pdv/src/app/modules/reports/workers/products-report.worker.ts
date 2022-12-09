/// <reference lib="webworker" />
import {ProductsReportBuilder} from '../components/products-report/products-report-builder';

addEventListener('message', ({data}) => {

  // Cria o relatório em PDF e emite a URL no método postMessage nativo do Web Worker
  const fileURL = ProductsReportBuilder.createProductsReportPDF(data[0], data[1]);
  postMessage(fileURL);

});
