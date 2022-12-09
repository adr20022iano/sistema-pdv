import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DateHelper} from '../../shared/helpers/date-helper';
import {SalesFilter} from '../models/sales-filter';
import {SalePayment} from '../models/sale-payment';
import {NewSale} from '../models/new-sale';
import {Sale} from '../models/sale';
import {SaleForEdition} from '../models/sale-for-edition';
import {SaleForPrint} from '../models/sale-for-print';

@Injectable({
  providedIn: 'root'
})
export class PosService {

  /** O código da venda que deverá ser focado ao carregar a lista de vendas */
  private focusTarget: number;

  constructor(private http: HttpClient) {
  }

  /**
   * Define o código da venda que deve ser focada ao carregar a lista de vendas
   * @param saleCode O código da venda que deverá ser focado
   */
  setFocusTarget(saleCode: number): void {
    this.focusTarget = saleCode;
  }

  /**
   * Retorna o código da venda que deve ser focada ao carregar a lista de vendas
   */
  getFocusTarget(): number {
    const currentTarget = this.focusTarget;
    this.focusTarget = undefined;
    return currentTarget;
  }

  /**
   * Realiza a consulta das vendas.
   * @param filter O filtro para a consulta
   * @param quotes Se deve realizar a consulta no endpoint de orçamentos.
   */
  getSales(filter: SalesFilter, quotes = false) {

    let queryParams = new HttpParams();
    if (filter.page) {
      queryParams = queryParams.set('page', filter.page.toString());
    }
    if (filter.codeObservation) {
      queryParams = queryParams.set('codeObservation', filter.codeObservation);
    }
    if (filter.customerCode) {
      queryParams = queryParams.set('customerCode', filter.customerCode.toString());
    }
    if (filter.date) {
      queryParams = queryParams.set('date', DateHelper.dateToString(filter.date));
    }
    if (filter.paymentStatus) {
      queryParams = queryParams.set('paymentStatus', filter.paymentStatus.toString());
    }
    if (filter.locked) {
      queryParams = queryParams.set('locked', filter.locked.toString());
    }

    return this.http.get<Sale[]>(quotes ? 'quote' : 'sale', {params: queryParams});

  }

  /**
   * Salva uma nova venda.
   * @param sale A nova venda que será salva.
   */
  saveNewSale(sale: NewSale) {
    return this.http.post<{ code: number }>('sale', JSON.stringify(sale));
  }

  /**
   * Salva as alterações de uma venda
   */
  saveSaleEdition(sale: NewSale) {
    return this.http.patch('sale', JSON.stringify(sale));
  }

  /**
   * Realiza a consulta de uma venda específica.
   * @param saleCode Código da venda a ser consultada.
   */
  getSale(saleCode: number) {
    return this.http.get<SaleForEdition>(`sale/${saleCode}`);
  }

  /**
   * Realiza a consulta dos lançamentos financeiros de uma venda.
   * @param saleCode Código da venda para consulta dos lançamentos.
   */
  getSalePayments(saleCode: number) {
    return this.http.get<SalePayment[]>(`salePayment/${saleCode}`);
  }

  /**
   * Excluí uma venda
   */
  deleteSale(saleCode: number) {
    return this.http.delete('sale/'.concat(saleCode.toString()));
  }

  /**
   * Excluí um orçamento
   */
  deleteQuote(quoteCode: number) {
    return this.http.delete('quote/'.concat(quoteCode.toString()));
  }

  /**
   * Realiza a consulta de uma venda parra impressão.
   * @param saleCode O código da venda que será impressa.
   */
  getSaleForPrint(saleCode: number) {
    const queryParams = new HttpParams().set('print', true.toString());
    return this.http.get<SaleForPrint>(`sale/${saleCode}`, {params: queryParams});
  }

  /**
   * Salva um orçamento.
   * @param quote A venda que será salva como orçamento.
   */
  saveQuote(quote: NewSale) {
    return this.http.post('quote', JSON.stringify(quote));
  }

  /**
   * Realiza a consulta de um orçamento específico.
   * @param quoteCode Código da venda a ser consultada.
   */
  getQuote(quoteCode: number) {
    return this.http.get<SaleForEdition>(`quote/${quoteCode}`);
  }

  /**
   * Salva a edição de um orçamento
   * @param quote O orçamento que será salvo
   */
  saveQuoteEdition(quote: NewSale) {
    return this.http.patch('quote', JSON.stringify(quote));
  }

  /**
   * Realiza a consulta de um orçamento para impressão.
   * @param quoteCode O código do orçamento que será impresso
   */
  getQuoteForPrint(quoteCode: number) {
    const queryParams = new HttpParams().set('print', true.toString());
    return this.http.get<SaleForPrint>(`quote/${quoteCode}`, {params: queryParams});
  }

}
