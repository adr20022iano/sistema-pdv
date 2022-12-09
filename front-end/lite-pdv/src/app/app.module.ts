import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
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
import {SellersModule} from './modules/sellers/sellers.module';
import {CustomersModule} from './modules/customers/customers.module';
import {CashBookModule} from './modules/cash-book/cash-book.module';
import {SettingsModule} from './modules/settings/settings.module';
import {ProductsModule} from './modules/products/products.module';
import {ReportsModule} from './modules/reports/reports.module';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    PlatformModule,
    BrowserAnimationsModule,
    CoreModule.forRoot(),
    BaseModule,
    LoginModule,
    PdvModule,
    SellersModule,
    CustomersModule,
    CashBookModule,
    SettingsModule,
    ProductsModule,
    ReportsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }
}
