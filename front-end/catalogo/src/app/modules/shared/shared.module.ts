import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DevapModule} from '../devap/devap.module';
import {ReactiveFormsModule} from '@angular/forms';
import {A11yModule} from '@angular/cdk/a11y';
import { PlaceholderComponent } from './components/error-placeholder/placeholder.component';
import { InCartPipe } from './pipes/in-cart.pipe';
import {CartLoaderComponent} from './components/cart-loader/cart-loader.component';

@NgModule({
  declarations: [PlaceholderComponent, InCartPipe, CartLoaderComponent],
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
    InCartPipe,
    PlaceholderComponent,
    CartLoaderComponent
  ]
})
export class SharedModule {
}
