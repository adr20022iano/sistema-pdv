import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {HeaderComponent} from './components/header/header.component';
import {BottomMenuComponent} from './components/bottom-menu/bottom-menu.component';
import {BottomMenuItemComponent} from './components/bottom-menu-item/bottom-menu-item.component';
import {DcRippleModule} from '@devap-br/devap-components/core';

@NgModule({
  declarations: [
    HeaderComponent,
    BottomMenuComponent,
    BottomMenuItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DcRippleModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    BottomMenuComponent
  ]
})
export class BaseModule { }
