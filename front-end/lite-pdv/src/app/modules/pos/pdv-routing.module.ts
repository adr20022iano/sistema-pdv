import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuard} from 'src/app/guards/login.guard';
import {NewSaleComponent} from './components/new-sale/new-sale.component';
import {SalesComponent} from './components/sales/sales.component';
import {EditSaleGuard} from './guards/edit-sale.guard';
import {NewSaleGuard} from './guards/new-sale.guard';

const routes: Routes = [
  {path: 'sales', component: SalesComponent, data: {title: 'Vendas', hasSideNav: true}, canActivate: [LoginGuard]},
  {path: 'quotes', component: SalesComponent, data: {title: 'Orçamentos', hasSideNav: true}, canActivate: [LoginGuard]},
  {
    path: 'sales/new-sale',
    component: NewSaleComponent,
    data: {title: 'Nova Venda', hasSideNav: true, backButtonRoute: 'sales'},
    canActivate: [LoginGuard],
    canDeactivate: [NewSaleGuard]
  },
  {
    path: 'sales/edit/:saleCode',
    component: NewSaleComponent,
    data: {title: 'Editar Venda', hasSideNav: true, backButtonRoute: 'sales'},
    canActivate: [LoginGuard],
    canDeactivate: [EditSaleGuard]
  },
  {
    path: 'quotes/edit/:saleCode',
    component: NewSaleComponent,
    data: {title: 'Editar Orçamento', hasSideNav: true, backButtonRoute: 'quotes'},
    canActivate: [LoginGuard],
    canDeactivate: [EditSaleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdvRoutingModule {
}
