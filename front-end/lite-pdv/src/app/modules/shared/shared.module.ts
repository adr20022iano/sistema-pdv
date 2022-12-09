import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {DevapModule} from '../devap/devap.module';
import {ConfirmationDlgComponent} from './components/confirmation-dlg/confirmation-dlg.component';
import {PlaceholderComponent} from './components/placeholder/placeholder.component';
import {ProductLayoutComponent} from './components/autocomplete-layouts/product-layout/product-layout.component';
import {DiscountPipe} from './pipes/discount.pipe';
import {ImageCropperComponent} from './components/image-cropper/image-cropper.component';
import {ImageUploaderComponent} from './components/image-uploader/image-uploader.component';
import {SelectOnFocusDirective} from './directives/select-on-focus.directive';
import {CustomerLayoutComponent} from './components/autocomplete-layouts/customer-layout/customer-layout.component';
import {ProductImageDlgComponent} from './components/product-image-dlg/product-image-dlg.component';
import {AutoFocusDirective} from './directives/auto-focus.directive';
import {HeaderMenuComponent} from './components/header-menu/header-menu.component';
import {ProgressBarComponent} from './components/progress-bar/progress-bar.component';

@NgModule({
  declarations: [
    ConfirmationDlgComponent,
    PlaceholderComponent,
    ProductLayoutComponent,
    DiscountPipe,
    ImageCropperComponent,
    ImageUploaderComponent,
    SelectOnFocusDirective,
    CustomerLayoutComponent,
    ProductImageDlgComponent,
    AutoFocusDirective,
    HeaderMenuComponent,
    ProgressBarComponent
  ],
  imports: [
    CommonModule,
    DevapModule,
    ReactiveFormsModule,
    A11yModule,
  ],
  exports: [
    DevapModule,
    ReactiveFormsModule,
    A11yModule,
    ConfirmationDlgComponent,
    PlaceholderComponent,
    ProductLayoutComponent,
    DiscountPipe,
    ImageCropperComponent,
    ImageUploaderComponent,
    SelectOnFocusDirective,
    CustomerLayoutComponent,
    ProductImageDlgComponent,
    AutoFocusDirective,
    HeaderMenuComponent,
    ProgressBarComponent
  ]
})
export class SharedModule {
}
