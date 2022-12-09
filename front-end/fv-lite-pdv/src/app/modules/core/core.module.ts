import {CommonModule, registerLocaleData} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import localePtBr from '@angular/common/locales/pt';
import {Title} from '@angular/platform-browser';
import {DEFAULT_CURRENCY_CODE, LOCALE_ID, ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {DateAdapter, DcNativeDateModule} from '@devap-br/devap-components/core';
import {DefaultDateAdapter, RECAPTCHA_V3_SITE_KEY} from '@devap-br/devap-components/common';

import {InterceptorService} from './services/interceptor.service';

// noinspection SpellCheckingInspection
const RECAPTCHA_V3_KEY = '6LeAmoQaAAAAADpDfmv313Jx8mo-RlSYXlAWz12W';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    DcNativeDateModule
  ]
})
export class CoreModule {

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {

    // Verifica se o CoreModule já foi carregado no sistema
    if (parentModule) {
      throw new Error('CoreModule já carregado. O CoreModule deve ser carregado apenas no AppModule');
    }

    registerLocaleData(localePtBr, 'pt');

  }

  /**
   * Inicializa o CoreModule com os providers especificados para ele
   */
  static forRoot(): ModuleWithProviders<CoreModule> {

    return {
      ngModule: CoreModule,
      providers: [
        Title,
        {provide: LOCALE_ID, useValue: 'pt'},
        {provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL'},
        {provide: RECAPTCHA_V3_SITE_KEY, useValue: RECAPTCHA_V3_KEY},
        {provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true},
        {provide: DateAdapter, useClass: DefaultDateAdapter},
      ]
    };

  }

}
