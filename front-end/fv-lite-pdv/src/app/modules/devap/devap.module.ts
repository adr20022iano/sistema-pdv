import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DcAutocompleteModule} from '@devap-br/devap-components/autocomplete';
import {DcButtonModule} from '@devap-br/devap-components/button';
import {DcCheckboxModule} from '@devap-br/devap-components/checkbox';
import {DcCommonModule} from '@devap-br/devap-components/common';
import {DcDatepickerModule} from '@devap-br/devap-components/datepicker';
import {DcDialogModule} from '@devap-br/devap-components/dialog';
import {DcFormFieldModule} from '@devap-br/devap-components/form-field';
import {DcIconModule} from '@devap-br/devap-components/icon';
import {DcInputModule} from '@devap-br/devap-components/input';
import {DcLoaderModule} from '@devap-br/devap-components/loader';
import {DcOverlayModule} from '@devap-br/devap-components/overlay';
import {DcSelectModule} from '@devap-br/devap-components/select';
import {DcSideMenuModule} from '@devap-br/devap-components/side-menu';
import {DcSideNavModule} from '@devap-br/devap-components/sidenav';
import {DcSnackBarModule} from '@devap-br/devap-components/snack-bar';
import {DcTooltipModule} from '@devap-br/devap-components/tooltip';
import {DcRadioModule} from '@devap-br/devap-components/radio';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DcAutocompleteModule,
    DcSideMenuModule,
    DcSideNavModule,
    DcOverlayModule,
    DcLoaderModule,
    DcCommonModule,
    DcFormFieldModule,
    DcCheckboxModule,
    DcButtonModule,
    DcIconModule,
    DcDialogModule,
    DcInputModule,
    DcSelectModule,
    DcSnackBarModule,
    DcDatepickerModule,
    DcTooltipModule,
    DcRadioModule
  ],
  exports: [
    DcAutocompleteModule,
    DcSideMenuModule,
    DcSideNavModule,
    DcOverlayModule,
    DcLoaderModule,
    DcCommonModule,
    DcFormFieldModule,
    DcCheckboxModule,
    DcButtonModule,
    DcIconModule,
    DcDialogModule,
    DcInputModule,
    DcSelectModule,
    DcSnackBarModule,
    DcDatepickerModule,
    DcTooltipModule,
    DcRadioModule
  ]
})
export class DevapModule {
}
