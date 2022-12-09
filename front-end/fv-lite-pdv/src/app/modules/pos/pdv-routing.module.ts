import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuard} from 'src/app/guards/login.guard';
import {NewSaleComponent} from './components/new-sale/new-sale.component';
import {SalesComponent} from './components/sales/sales.component';
import {EditSaleGuard} from './guards/edit-sale.guard';
import {NewSaleGuard} from './guards/new-sale.guard';

const routes: Routes = [
  {path: 'sales', component: SalesComponent, data: {title: 'Vendas', showBottomNav: true}, canActivate: [LoginGuard]},
  {path: 'quotes', component: SalesComponent, data: {title: 'Orçamentos', showBottomNav: true}, canActivate: [LoginGuard]},
  {
    path: 'sales/new-sale',
    component: NewSaleComponent,
    data: {title: 'Nova venda', showBottomNav: true},
    canActivate: [LoginGuard],
    canDeactivate: [NewSaleGuard]
  },
  {
    path: 'sales/edit/:saleCode',
    component: NewSaleComponent,
    data: {title: 'Editar venda', showBottomNav: true},
    canActivate: [LoginGuard],
    canDeactivate: [EditSaleGuard]
  },
  {
    path: 'sales/view/:saleCode',
    component: NewSaleComponent,
    data: {title: 'Visualizar venda', showBottomNav: true},
    canActivate: [LoginGuard],
    canDeactivate: [EditSaleGuard]
  },
  {
    path: 'quotes/edit/:saleCode',
    component: NewSaleComponent,
    data: {title: 'Editar Orçamento', showBottomNav: true},
    canActivate: [LoginGuard],
    canDeactivate: [EditSaleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdvRoutingModule {
}
