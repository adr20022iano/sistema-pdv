import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuard} from 'src/app/guards/login.guard';
import {CashBookComponent} from './components/cash-book/cash-book.component';

const routes: Routes = [
  {
    path: 'cash-book',
    component: CashBookComponent,
    data: {hasSideNav: true, title: 'Caixa'},
    canActivate: [LoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashBookRoutingModule {
}
