import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {LoginComponent} from './components/login/login.component';
import {LoginRoutingModule} from './login-routing.module';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import { IosInstallTipComponent } from './components/ios-install-tip/ios-install-tip.component';

@NgModule({
  declarations: [
    LoginComponent,
    PageNotFoundComponent,
    IosInstallTipComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    SharedModule,
  ]
})
export class LoginModule {
}
