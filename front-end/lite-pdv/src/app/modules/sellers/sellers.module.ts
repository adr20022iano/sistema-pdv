import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SellersRoutingModule} from './sellers-routing.module';
import {SellersComponent} from './components/sellers/sellers.component';
import {SellerItemComponent} from './components/seller-item/seller-item.component';
import {SharedModule} from '../shared/shared.module';
import {NewSellerComponent} from './components/new-seller/new-seller.component';

@NgModule({
  declarations: [
    SellersComponent,
    SellerItemComponent,
    NewSellerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SellersRoutingModule
  ]
})
export class SellersModule {
}
