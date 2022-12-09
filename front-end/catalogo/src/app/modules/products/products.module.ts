import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProductsRoutingModule} from './products-routing.module';
import {FeaturedProductsComponent} from './components/featured/featured-products.component';
import {SharedModule} from '@shared/shared.module';
import {ProductComponent} from './components/product/product.component';
import {FeaturedCategoryComponent} from './components/featured-category/featured-category.component';
import {ProductsComponent} from './components/products/products.component';
import {ProductDetailsComponent} from './components/product-details/product-details.component';
import {ProductLoaderComponent} from './components/product-loader/product-loader.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

@NgModule({
    declarations: [FeaturedProductsComponent, ProductComponent, FeaturedCategoryComponent, ProductsComponent,
        ProductDetailsComponent, ProductLoaderComponent, NotFoundComponent],
    exports: [
        ProductComponent
    ],
    imports: [
        CommonModule,
        ProductsRoutingModule,
        SharedModule
    ]
})
export class ProductsModule {
}
