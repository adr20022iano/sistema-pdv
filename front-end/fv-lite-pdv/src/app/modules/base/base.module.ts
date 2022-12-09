import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {HeaderComponent} from './components/header/header.component';
import {BottomNavComponent} from './components/bottom-nav/bottom-nav.component';
import {BottomNavItemComponent} from './components/bottom-nav-item/bottom-nav-item.component';
import {DcRippleModule} from '@devap-br/devap-components/core';

@NgModule({
  declarations: [
    HeaderComponent,
    BottomNavComponent,
    BottomNavItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DcRippleModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    BottomNavComponent
  ]
})
export class BaseModule { }
