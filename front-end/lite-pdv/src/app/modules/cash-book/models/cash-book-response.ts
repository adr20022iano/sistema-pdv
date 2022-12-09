import {CashBookEntry} from './cash-book-entry';

export interface CashBookResponse {

  /** O saldo atual do caixa */
  balance: number;

  /** Lista dos lançamentos do caixa */
  list: CashBookEntry[];

}
