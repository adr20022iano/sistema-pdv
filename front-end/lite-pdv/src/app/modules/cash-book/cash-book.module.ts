import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {CashBookRoutingModule} from './cash-book-routing.module';
import {CashBookComponent} from './components/cash-book/cash-book.component';
import {CashBookCategoryComponent} from './components/cash-book-category/cash-book-category.component';
import {CashBookCategoriesComponent} from './components/cash-book-categories/cash-book-categories.component';
import {CashBookEntryComponent} from './components/cash-book-entry/cash-book-entry.component';
import {NewCashBookEntryComponent} from './components/new-cash-book-entry/new-cash-book-entry.component';

@NgModule({
  declarations: [CashBookComponent, CashBookEntryComponent, NewCashBookEntryComponent, CashBookCategoryComponent,
    CashBookCategoriesComponent],
  imports: [
    CommonModule,
    SharedModule,
    CashBookRoutingModule
  ]
})
export class CashBookModule {
}
