import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShoppingCartComponent} from './components/shopping-cart/shopping-cart.component';
import {CartRoutingModule} from './cart-routing.module';
import {CartItemComponent} from './components/cart-item/cart-item.component';
import {SharedModule} from '@shared/shared.module';
import {UserModule} from '../user/user.module';


@NgModule({
  declarations: [ShoppingCartComponent, CartItemComponent],
  imports: [
    CommonModule,
    CartRoutingModule,
    UserModule,
    SharedModule
  ]
})
export class CartModule {
}
