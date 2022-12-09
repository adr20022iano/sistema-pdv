import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuard} from 'src/app/guards/login.guard';
import {ProductsComponent} from './components/products/products.component';

const routes: Routes = [
  {path: 'products', component: ProductsComponent, data: {title: 'Produtos', showBottomNav: true}, canActivate: [LoginGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule {
}
