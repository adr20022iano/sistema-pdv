import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@shared/shared.module';
import {HeaderComponent} from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { CategoryItemComponent } from './components/category-item/category-item.component';
import { DrawerMenuComponent } from './components/drawer-menu/drawer-menu.component';
import {RouterModule} from '@angular/router';
import { ContactComponent } from './components/contact/contact.component';

@NgModule({
  declarations: [HeaderComponent, FooterComponent, CategoriesComponent, CategoryItemComponent, DrawerMenuComponent, ContactComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  exports: [HeaderComponent, FooterComponent, DrawerMenuComponent]
})
export class BaseModule {
}
