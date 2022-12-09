import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProductsReportParams} from '../models/products/products-report-params';
import {ProductsReportResponse} from '../models/products/products-report-response';
import {StockHandlingReportParams} from '../models/stock-handling/stock-handling-report-params';
import {StockHandlingReportResponse} from '../models/stock-handling/stock-handling-report-response';
import {CashBookReportParams} from '../models/cash-book/cash-book-report-params';
import {CashBookReportResponse} from '../models/cash-book/cash-book-report-response';
import {SalesReportParams} from '../models/sales/sales-report-params';
import {SalesReportResponse} from '../models/sales/sales-report-response';
import {SalesPaymentsReportParams} from '../models/sales-payments/sales-payments-report-params';
import {SalesPaymentsReportResponse} from '../models/sales-payments/sales-payments-report-response';
import {SalesProductsReportParams} from '../models/sale-products/sales-products-report-params';
import {SalesProductsReportResponse} from '../models/sale-products/sales-products-report-response';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private http: HttpClient) {
  }

  /**
   * Envia a requisição para gerar um relatório de produtos
   * @param reportParams Parâmetros do relatório.
   */
  productsReport(reportParams: ProductsReportParams) {
    return this.http.post<ProductsReportResponse>('reports/product', JSON.stringify(reportParams));
  }

  /**
   * Envia a requisição para gerar um relatório de movimentações de estoque.
   * @param reportParams Parâmetros do relatório.
   */
  stockHandlingReport(reportParams: StockHandlingReportParams) {
    return this.http.post<StockHandlingReportResponse>('reports/stockHandling', JSON.stringify(reportParams));
  }

  /**
   * Envia a requisição para gerar um relatório de caixa.
   * @param reportParams Parâmetros do relatório
   */
  cashBookReport(reportParams: CashBookReportParams) {
    return this.http.post<CashBookReportResponse>('reports/cashBook', JSON.stringify(reportParams));
  }

  /**
   * Envia a requisição para gerar um relatório de vendas.
   * @param reportParams Parâmetros do relatório
   */
  salesReport(reportParams: SalesReportParams) {
    return this.http.post<SalesReportResponse>('reports/sale', JSON.stringify(reportParams));
  }

  /**
   * Envia a requisição para gerar um relatório de vendas.
   * @param reportParams Parâmetros do relatório
   */
  salesPaymentsReport(reportParams: SalesPaymentsReportParams) {
    return this.http.post<SalesPaymentsReportResponse>('reports/salePayment', JSON.stringify(reportParams));
  }

  /**
   * Envia a requisição para gerar um relatório de produtos das vendas.
   * @param reportParams Parâmetros do relatório
   */
  saleProductsReport(reportParams: SalesProductsReportParams) {
    return this.http.post<SalesProductsReportResponse>('reports/saleProduct', JSON.stringify(reportParams));
  }

}
