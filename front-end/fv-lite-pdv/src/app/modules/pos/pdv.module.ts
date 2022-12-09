import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {PdvRoutingModule} from './pdv-routing.module';
import {SaleComponent} from './components/sales/sale/sale.component';
import {SalesComponent} from './components/sales/sales.component';
import {NewSaleComponent} from './components/new-sale/new-sale.component';
import {SaleProductsComponent} from './components/new-sale/sale-products/sale-products.component';
import {SaleProductComponent} from './components/new-sale/sale-product/sale-product.component';
import {EditSaleProductComponent} from './components/new-sale/edit-sale-product/edit-sale-product.component';
import {NewSaleTotalsComponent} from './components/new-sale/new-sale-totals/new-sale-totals.component';
import {SaleDiscountComponent} from './components/new-sale/sale-discount/sale-discount.component';
import {SaleExtrasComponent} from './components/new-sale/sale-extras/sale-extras.component';
import {SalePaymentsComponent} from './components/sales/sale-payments/sale-payments.component';
import {SalePaymentComponent} from './components/sales/sale-payments/sale-payment/sale-payment.component';
import {SalesFilterComponent} from './components/sales-filter/sales-filter.component';
import {SaleShippingComponent} from './components/new-sale/sale-shipping/sale-shipping.component';
import {SaleExtraButtonComponent} from './components/new-sale/sale-extras/sale-extra-button/sale-extra-button.component';
import {SelectCustomerComponent} from './components/new-sale/select-customer/select-customer.component';
import {SaleCustomerComponent} from './components/new-sale/select-customer/sale-customer/sale-customer.component';
import {SaleObservationComponent} from './components/new-sale/sale-observation/sale-observation.component';
import {DcRippleModule} from '@devap-br/devap-components';
import { BlockedSaleInfoComponent } from './components/new-sale/blocked-sale-info/blocked-sale-info.component';

@NgModule({
  declarations: [SaleComponent, SalesComponent, NewSaleComponent, SaleProductsComponent, SaleProductComponent, EditSaleProductComponent,
    NewSaleTotalsComponent, SaleDiscountComponent, SaleExtrasComponent, SalePaymentsComponent, SalePaymentComponent, SalesFilterComponent,
    SaleShippingComponent, SaleExtraButtonComponent, SelectCustomerComponent, SaleCustomerComponent, SaleObservationComponent, BlockedSaleInfoComponent],
    imports: [
        CommonModule,
        SharedModule,
        PdvRoutingModule,
        DcRippleModule
    ]
})
export class PdvModule {
}
