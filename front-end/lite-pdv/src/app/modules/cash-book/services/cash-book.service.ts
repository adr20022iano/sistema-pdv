import {HttpClient} from '@angular/common/http';
import {Injectable, OnDestroy} from '@angular/core';
import {DateHelper} from '../../shared/helpers/date-helper';
import {BookCategory} from '../models/book-category';
import {CashBookEntry} from '../models/cash-book-entry';
import {CashBookResponse} from '../models/cash-book-response';

@Injectable({
  providedIn: 'root'
})
export class CashBookService implements OnDestroy {

  private CASH_BOOK_ENTRIES = 'cashBookEntry';
  private CASH_BOOK_CATEGORIES = 'bookCategory';

  constructor(private http: HttpClient) {
  }

  /**
   * Realiza a consulta dos lançamentos do caixa.
   * @param date A data de filtro do caixa.
   */
  loadEntries(date: Date) {
    return this.http.get<CashBookResponse>(this.CASH_BOOK_ENTRIES
      .concat('/', DateHelper.dateToString(date)));
  }

  /**
   * Realiza um novo lançamento no caixa
   * @param entry O lançamento que será realizado no caixa
   * @return O lançamento que deve ser exibido na listagem
   */
  newEntry(entry: CashBookEntry) {
    return this.http.post<{ code: number }>(this.CASH_BOOK_ENTRIES, JSON.stringify(entry));
  }

  /**
   * Exclui o lançamento informado.
   * @param entryCode Código do lançamento que será excluído.
   */
  deleteEntry(entryCode: number) {
    return this.http.delete(this.CASH_BOOK_ENTRIES.concat('/', entryCode.toString()));
  }

  /**
   * Realiza a consulta das categorias.
   */
  loadCategories() {
    return this.http.get<BookCategory[]>(this.CASH_BOOK_CATEGORIES);
  }

  /**
   * Adiciona uma nova categoria.
   * @param categoryName O nome da categoria.
   * @param categoryType O tipo da categoria (1 - Receita | 2 - Despesa).
   */
  newCategory(categoryName: string, categoryType: 1 | 2) {
    return this.http.post<{ code: number }>(this.CASH_BOOK_CATEGORIES, JSON.stringify({
      name: categoryName,
      type: categoryType
    }));
  }

  /**
   * Edita a categoria informada.
   * @param categoryCode O código da categoria.
   * @param categoryName O nome da categoria.
   * @param categoryType O tipo da categoria (1 - Receita | 2 - Despesa).
   */
  updateCategory(categoryCode: number, categoryName: string, categoryType: 1 | 2) {
    return this.http.patch(this.CASH_BOOK_CATEGORIES, JSON.stringify({
      code: categoryCode,
      name: categoryName,
      type: categoryType
    }));
  }

  /**
   * Deleta uma categoria.
   * @param categoryCode Código da categoria que será deletada.
   */
  deleteCategory(categoryCode: number) {
    return this.http.delete(this.CASH_BOOK_CATEGORIES.concat('/', categoryCode.toString()));
  }

  ngOnDestroy(): void {
  }

}
