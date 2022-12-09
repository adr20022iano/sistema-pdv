import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ReportsRoutingModule} from './reports-routing.module';
import {ReportsComponent} from './components/reports/reports.component';
import {SharedModule} from '../shared/shared.module';
import {ReportCardComponent} from './components/report-card/report-card.component';
import {ProductsReportComponent} from './components/products-report/products-report.component';
import {StockHandlingReportComponent} from './components/stock-handling-report/stock-handling-report.component';
import {CashBookReportComponent} from './components/cash-book-report/cash-book-report.component';
import {SalesReportComponent} from './components/sales-report/sales-report.component';
import {SalesPaymentReportComponent} from './components/sales-payment-report/sales-payment-report.component';
import {SalesProductsReportComponent} from './components/sales-products-report/sales-products-report.component';


@NgModule({
  declarations: [
    ReportsComponent,
    ReportCardComponent,
    ProductsReportComponent,
    StockHandlingReportComponent,
    CashBookReportComponent,
    SalesReportComponent,
    SalesPaymentReportComponent,
    SalesProductsReportComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule
  ]
})
export class ReportsModule {
}
