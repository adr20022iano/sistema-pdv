import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FeaturedProductsComponent} from './components/featured/featured-products.component';
import {ProductsComponent} from './components/products/products.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

const routes: Routes = [
  {path: '', component: FeaturedProductsComponent},
  {path: 'products', component: ProductsComponent},
  {path: 'products/:code', component: ProductsComponent},
  {path: '404', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule {
}
