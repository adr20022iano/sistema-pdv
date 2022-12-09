import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginGuard} from '../../guards/login.guard';
import {ReportsComponent} from './components/reports/reports.component';
import {ReportsGuard} from '../../guards/reports.guard';

const routes: Routes = [
  {path: 'reports', component: ReportsComponent, data: {title: 'Relatórios', hasSideNav: true}, canActivate: [LoginGuard, ReportsGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {
}
