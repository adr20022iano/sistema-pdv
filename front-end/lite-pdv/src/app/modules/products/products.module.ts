import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProductsRoutingModule} from './products-routing.module';
import {ProductsComponent} from './components/products/products.component';
import {SharedModule} from '../shared/shared.module';
import {ProductsCategoriesComponent} from './components/product-categories/product-categories.component';
import {ProductsCategoryComponent} from './components/product-category/product-category.component';
import {NewProductComponent} from './components/new-product/new-product.component';
import {ProductComponent} from './components/product/product.component';
import {NewStockHandlingComponent} from './components/new-stock-handling/new-stock-handling.component';
import {StockHandlingsComponent} from './components/stock-handlings/stock-handlings.component';
import {StockHandlingComponent} from './components/stock-handling/stock-handling.component';
import {UpdateSaleValueComponent} from './components/update-sale-value/update-sale-value.component';
import {ProductsFilterComponent} from './components/products-filter/products-filter.component';
import {ProductProductionComponent} from './components/product-production/product-production.component';
import {ProductionItemComponent} from './components/production-item/production-item.component';
import { ScaleExportComponent } from './components/scale-export/scale-export.component';


@NgModule({
  declarations: [
    ProductsComponent, ProductsCategoriesComponent, ProductsCategoryComponent, NewProductComponent, ProductComponent,
    NewStockHandlingComponent, StockHandlingsComponent, StockHandlingComponent, UpdateSaleValueComponent, ProductsFilterComponent,
    ProductProductionComponent, ProductionItemComponent, ScaleExportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule {
}
