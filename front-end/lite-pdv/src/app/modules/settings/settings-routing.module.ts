import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminGuard} from 'src/app/guards/admin.guard';
import {LoginGuard} from 'src/app/guards/login.guard';
import {PasswordSettingsComponent} from './components/password-settings/password-settings.component';
import {SystemSettingsComponent} from './components/system-settings/system-settings.component';
import {version} from 'package.json';
import {CompanyDetailsComponent} from './components/company-details/company-details.component';
import {SystemBehaviorComponent} from './components/system-behavior/system-behavior.component';
import {SellerPermissionsComponent} from './components/seller-permissions/seller-permissions.component';
import {SystemResourcesComponent} from './components/system-resources/system-resources.component';
import {CatalogSettingsComponent} from './components/catalog-settings/catalog-settings.component';

const routes: Routes = [
  {
    path: 'settings',
    component: SystemSettingsComponent,
    data: {title: 'Configurações '.concat(' - Versão: ', version), hasSideNav: true},
    canActivate: [LoginGuard, AdminGuard]
  },
  {
    path: 'settings/password-settings',
    component: PasswordSettingsComponent,
    data: {title: 'Configurações de senha', hasSideNav: true, backButtonRoute: 'settings'},
    canActivate: [LoginGuard, AdminGuard]
  },
  {
    path: 'settings/company-details',
    component: CompanyDetailsComponent,
    data: {title: 'Dados da empresa na impressão', hasSideNav: true, backButtonRoute: 'settings'},
    canActivate: [LoginGuard, AdminGuard]
  },
  {
    path: 'settings/system-behavior',
    component: SystemBehaviorComponent,
    data: {title: 'Comportamentos do sistema', hasSideNav: true, backButtonRoute: 'settings'},
    canActivate: [LoginGuard, AdminGuard]
  },
  {
    path: 'settings/seller-permissions',
    component: SellerPermissionsComponent,
    data: {title: 'Permissões dos vendedores', hasSideNav: true, backButtonRoute: 'settings'},
    canActivate: [LoginGuard, AdminGuard]
  },
  {
    path: 'settings/system-resources',
    component: SystemResourcesComponent,
    data: {title: 'Recursos do sistema', hasSideNav: true, backButtonRoute: 'settings'},
    canActivate: [LoginGuard, AdminGuard]
  },
  {
    path: 'settings/catalog-settings',
    component: CatalogSettingsComponent,
    data: {title: 'Configurações do catálogo', hasSideNav: true, backButtonRoute: 'settings'},
    canActivate: [LoginGuard, AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {
}
