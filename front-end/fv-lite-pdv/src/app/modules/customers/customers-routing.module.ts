import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomersComponent } from './components/customers/customers.component';
import { LoginGuard } from 'src/app/guards/login.guard';

const routes: Routes = [
  { path: 'customers', component: CustomersComponent, data: { title: 'Clientes', showBottomNav: true }, canActivate: [LoginGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
