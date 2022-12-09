/// <reference lib="webworker" />

import {CashBookReportBuilder} from '../components/cash-book-report/cash-book-report-builder';

addEventListener('message', ({data}) => {

  // Cria o relatório em PDF e emite a URL no método postMessage nativo do Web Worker
  const fileURL = CashBookReportBuilder.createCashBookReport(data[0], data[1]);
  postMessage(fileURL);

});
