/// <reference lib="webworker" />

import {StockHandlingReportBuilder} from '../components/stock-handling-report/stock-handling-report-builder';

addEventListener('message', ({data}) => {

  // Cria o relatório em PDF e emite a URL no método postMessage nativo do Web Worker
  const fileURL = StockHandlingReportBuilder.createStockHandlingReportPDF(data[0], data[1]);
  postMessage(fileURL);

});
