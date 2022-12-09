import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginGuard} from 'src/app/guards/login.guard';
import {SellersComponent} from './components/sellers/sellers.component';
import {AdminGuard} from '../../guards/admin.guard';

const routes: Routes = [
  {
    path: 'sellers',
    component: SellersComponent,
    data: {title: 'Vendedores', hasSideNav: true, backButtonRoute: 'settings'},
    canActivate: [LoginGuard, AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellersRoutingModule {
}
