import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SettingsRoutingModule} from './settings-routing.module';
import {SystemSettingsComponent} from './components/system-settings/system-settings.component';
import {SharedModule} from '../shared/shared.module';
import {PasswordSettingsComponent} from './components/password-settings/password-settings.component';
import {CompanyDetailsComponent} from './components/company-details/company-details.component';
import {SystemBehaviorComponent} from './components/system-behavior/system-behavior.component';
import {SellerPermissionsComponent} from './components/seller-permissions/seller-permissions.component';
import {SystemResourcesComponent} from './components/system-resources/system-resources.component';
import {SettingCardComponent} from './components/setting-card/setting-card.component';
import { SettingsTitleComponent } from './components/settings-title/settings-title.component';
import { CatalogSettingsComponent } from './components/catalog-settings/catalog-settings.component';


@NgModule({
  declarations: [
    SystemSettingsComponent,
    PasswordSettingsComponent,
    CompanyDetailsComponent,
    SystemBehaviorComponent,
    SellerPermissionsComponent,
    SystemResourcesComponent,
    SettingCardComponent,
    SettingsTitleComponent,
    CatalogSettingsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule {
}
