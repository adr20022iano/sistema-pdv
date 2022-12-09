import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserLoginComponent} from './components/user-login/user-login.component';
import {SharedModule} from '@shared/shared.module';
import {UserOrdersComponent} from './components/user-orders/user-orders.component';
import {UserOrderComponent} from './components/user-order/user-order.component';
import {OrderDetailsComponent} from './components/order-details/order-details.component';
import {UserRoutingModule} from './user-routing.module';
import { OrderDetailsItemComponent } from './components/order-details-item/order-details-item.component';

@NgModule({
  declarations: [UserLoginComponent, UserOrdersComponent, UserOrderComponent, OrderDetailsComponent, OrderDetailsItemComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule
  ],
  exports: [UserLoginComponent, UserOrdersComponent]
})
export class UserModule {
}
