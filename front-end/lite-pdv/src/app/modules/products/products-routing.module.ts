import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuard} from 'src/app/guards/login.guard';
import {StockHandlingsComponent} from './components/stock-handlings/stock-handlings.component';
import {ProductsComponent} from './components/products/products.component';

const routes: Routes = [
  {
    path: 'products',
    component: ProductsComponent,
    data: {title: 'Produtos', hasSideNav: true},
    canActivate: [LoginGuard]
  },
  {
    path: 'production',
    component: ProductsComponent,
    data: {title: 'Produtos de Produção', hasSideNav: true},
    canActivate: [LoginGuard]
  },
  {
    path: 'products/stock-handling/:productCode',
    component: StockHandlingsComponent,
    data: {title: 'Movimentações de estoque', hasSideNav: true, backButtonRoute: 'products'},
    canActivate: [LoginGuard]
  },
  {
    path: 'production/stock-handling/:productCode',
    component: StockHandlingsComponent,
    data: {title: 'Movimentações de estoque', hasSideNav: true, backButtonRoute: 'production'},
    canActivate: [LoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule {
}
