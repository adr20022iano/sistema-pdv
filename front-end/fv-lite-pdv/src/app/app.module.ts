import {PlatformModule} from '@angular/cdk/platform';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BaseModule} from './modules/base/base.module';
import {CoreModule} from './modules/core/core.module';
import {LoginModule} from './modules/login/login.module';
import {PdvModule} from './modules/pos/pdv.module';
import {CustomersModule} from './modules/customers/customers.module';
import {ProductsModule} from './modules/products/products.module';
import {DcSideNavModule} from '@devap-br/devap-components/sidenav';
import {DcButtonModule} from '@devap-br/devap-components/button';
import {DcIconModule, DcRippleModule} from '@devap-br/devap-components';
import {PwaService} from './modules/core/services/pwa.service';

// Esta função inicializa o a verificação do serviço de PWA
function initializeApp(pwaService: PwaService) {
  return () => pwaService.initPwaPrompt();
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    PlatformModule,
    BrowserAnimationsModule,
    CoreModule.forRoot(),
    DcSideNavModule,
    BaseModule,
    LoginModule,
    PdvModule,
    CustomersModule,
    ProductsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    DcButtonModule,
    DcIconModule,
    DcRippleModule
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: initializeApp, deps: [PwaService], multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }
}
