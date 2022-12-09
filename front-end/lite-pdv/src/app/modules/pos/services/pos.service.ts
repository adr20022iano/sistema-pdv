import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DateHelper} from '../../shared/helpers/date-helper';
import {SalesFilter} from '../models/sales-filter';
import {SalePayment} from '../models/sale-payment';
import {NewSale} from '../models/new-sale';
import {NewSalePayment} from '../models/new-sale-payment';
import {Sale} from '../models/sale';
import {SaleForEdition} from '../models/sale-for-edition';
import {SaleForPrint} from '../models/sale-for-print';
import {MultiplePayment} from '../models/multiple-payment';
import {Observable} from 'rxjs';

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

    // Como o parâmetro da origem, também pode ter o valor 0 (PDV), realizamos sua verificação
    // usando a classe Number
    if (Number.isFinite(filter.origin)) {
      queryParams = queryParams.set('origin', filter.origin.toString());
    }

    if (filter.locked) {
      queryParams = queryParams.set('locked', filter.locked.toString());
    }

    if (filter.sellerCode) {
      queryParams = queryParams.set('sellerCode', filter.sellerCode.toString());
    }

    if (Number.isFinite(filter.value)) {
      queryParams = queryParams.set('value', filter.value.toString());
    }

    return this.http.get<Sale[]>(quotes ? 'quote' : 'sale', {params: queryParams});

  }

  /**
   * Deleta uma venda. (Apenas administrador).
   * @param saleCode Código da venda a ser deletada.
   */
  deleteSale(saleCode: number) {
    return this.http.delete(`sale/${saleCode}`);
  }

  /**
   * Deleta um orçamento
   * @param quoteCode O código do orçamento a ser excluído.
   */
  deleteQuote(quoteCode: number) {
    return this.http.delete(`quote/${quoteCode}`);
  }

  /**
   * Carrega uma venda ou orçamento para edição.
   * @param saleCode O código da venda/orçamento para consulta.
   * @param quote Se deve realizar a consulta no endpoint de orçamentos.
   */
  loadSaleForEdition(saleCode: number, quote = false): Observable<SaleForEdition> {
    const url = quote ? 'quote/' : 'sale/';
    return this.http.get<SaleForEdition>(url.concat(saleCode.toString()));
  }

  /**
   * Salva uma nova venda ou a edição de uma já existente.
   * @param sale A venda que será salva.
   */
  saveSale(sale: NewSale): Observable<any> {
    return sale.code ? this.http.patch('sale', sale) : this.http.post('sale', sale);
  }

  /**
   * Salva um novo orçamento ou a edição de um já existente.
   * @param quote O orçamento que será salvo.
   */
  saveQuote(quote: NewSale): Observable<any> {
    return quote.code ? this.http.patch('quote', quote) : this.http.post('quote', quote);
  }

  /**
   * Realiza a consulta dos lançamentos financeiros de uma venda.
   * @param saleCode Código da venda para consulta dos lançamentos.
   */
  getSalePayments(saleCode: number) {
    return this.http.get<SalePayment[]>(`salePayment/${saleCode}`);
  }

  /**
   * Adiciona um novo lançamento financeiro da venda.
   * @param newPayment O novo lançamento financeiro da venda.
   */
  addSalePayment(newPayment: NewSalePayment) {
    return this.http.post<{ code: number }>('salePayment', JSON.stringify(newPayment));
  }

  /**
   * Adiciona um novo pagamento de múltiplas vendas para um cliente.
   * @param payment O pagamento informado.
   */
  addMultiplePayment(payment: MultiplePayment) {
    return this.http.post('multipleSalesPayment', JSON.stringify(payment));
  }

  /**
   * Deleta um lançamento financeiro de uma venda.
   * @param paymentCode O código do lançamento financeiro a ser deletado.
   */
  deleteSalePayment(paymentCode: number) {
    return this.http.delete(`salePayment/${paymentCode}`);
  }

  /**
   * Realiza a consulta de uma venda parra impressão.
   * @param saleCode O código da venda que será impressa.
   * @param saleLocked Se a venda está bloqueada ou não.
   */
  setSaleLock(saleCode: number, saleLocked: boolean) {
    return this.http.patch<any>('saleLocked', JSON.stringify({code: saleCode, locked: saleLocked}));
  }

  /**
   * Realiza a consulta de uma venda/orçamento para impressão.
   * @param saleCode O código da venda que será impressa.
   * @param quote Se venda que será carregada é um orçamento
   */
  getSaleForPrint(saleCode: number, quote: boolean) {
    const queryParams = new HttpParams().set('print', true.toString());
    const url = quote ? 'quote' : 'sale';
    return this.http.get<SaleForPrint>(url.concat('/', saleCode.toString()), {params: queryParams});
  }

}
