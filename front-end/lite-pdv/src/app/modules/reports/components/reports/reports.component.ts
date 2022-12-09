import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {ProductsReportComponent} from '../products-report/products-report.component';
import {StockHandlingReportComponent} from '../stock-handling-report/stock-handling-report.component';
import {CashBookReportComponent} from '../cash-book-report/cash-book-report.component';
import {SalesReportComponent} from '../sales-report/sales-report.component';
import {SalesPaymentReportComponent} from '../sales-payment-report/sales-payment-report.component';
import {AuthService} from '../../../core/services/auth.service';
import {SalesProductsReportComponent} from '../sales-products-report/sales-products-report.component';

@Component({
  selector: 'lpdv-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {

  /** Se o usuário é um administrador ou não */
  isAdmin: boolean;

  constructor(private sideMenu: DcSideMenu, private authService: AuthService) {
    this.isAdmin = this.authService.isAdmin();
  }

  /**
   * Abre o menu de relatório de movimentação de estoque.
   */
  productsReport() {
    this.sideMenu.open(ProductsReportComponent);
  }

  /**
   * Abre o menu de relatório de movimentação de estoque.
   */
  stockHandlingReport() {
    this.sideMenu.open(StockHandlingReportComponent);
  }

  /**
   * Abre o menu de relatório de caixa.
   */
  cashBookReport() {
    this.sideMenu.open(CashBookReportComponent);
  }

  /**
   * Abre o menu de relatório de vendas.
   */
  salesReport() {
    this.sideMenu.open(SalesReportComponent);
  }

  /**
   * Abre o menu de relatório de recebimentos de vendas.
   */
  salesPaymentsReport() {
    this.sideMenu.open(SalesPaymentReportComponent);
  }

  /**
   * Abre o menu de relatório de produtos vendidos.
   */
  productsSaleReport() {
    this.sideMenu.open(SalesProductsReportComponent, {autoFocus: false});
  }


  ngOnInit(): void {
  }

}
