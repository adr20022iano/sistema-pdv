import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProductsRoutingModule} from './products-routing.module';
import {ProductsComponent} from './components/products/products.component';
import {SharedModule} from '../shared/shared.module';
import {ProductsCategoriesComponent} from './components/product-categories/product-categories.component';
import {ProductsCategoryComponent} from './components/product-category/product-category.component';
import {ProductComponent} from './components/product/product.component';
import {ProductsFilterComponent} from './components/products-filter/products-filter.component';


@NgModule({
  declarations: [
    ProductsComponent, ProductsCategoriesComponent, ProductsCategoryComponent, ProductComponent, ProductsFilterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule {
}
