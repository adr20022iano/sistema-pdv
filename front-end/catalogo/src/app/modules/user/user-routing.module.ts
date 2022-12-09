import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OrderDetailsComponent} from './components/order-details/order-details.component';
import {LoginGuard} from '../../guards/login.guard';

const routes: Routes = [
  {path: 'order/:orderCode', component: OrderDetailsComponent, canActivate: [LoginGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
