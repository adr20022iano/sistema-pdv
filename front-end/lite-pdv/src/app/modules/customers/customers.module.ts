import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CustomersRoutingModule} from './customers-routing.module';
import {SharedModule} from '../shared/shared.module';
import {CustomersComponent} from './components/customers/customers.component';
import {CustomerItemComponent} from './components/customer-item/customer-item.component';
import {NewCustomerComponent} from './components/new-customer/new-customer.component';
import {CustomersFilterComponent} from './components/customers-filter/customers-filter.component';


@NgModule({
  declarations: [CustomersComponent, CustomerItemComponent, NewCustomerComponent, CustomersFilterComponent],
  imports: [
    CommonModule,
    SharedModule,
    CustomersRoutingModule
  ]
})
export class CustomersModule {
}
