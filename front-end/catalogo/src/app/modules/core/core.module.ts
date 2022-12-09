import {DEFAULT_CURRENCY_CODE, LOCALE_ID, ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule, registerLocaleData} from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import {Title, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {DateAdapter, DcNativeDateModule} from '@devap-br/devap-components/core';
import {DefaultDateAdapter, RECAPTCHA_V3_SITE_KEY} from '@devap-br/devap-components/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {InterceptorService} from '@core/services/interceptor.service';
import {CustomHammer} from '@core/extras/custom-hammer';
import {catalogParams} from '@core/catalog-params';

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
        {provide: RECAPTCHA_V3_SITE_KEY, useValue: catalogParams.reCaptchaKey},
        {provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true},
        {provide: DateAdapter, useClass: DefaultDateAdapter},
        {provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammer},
      ]
    };

  }

}
