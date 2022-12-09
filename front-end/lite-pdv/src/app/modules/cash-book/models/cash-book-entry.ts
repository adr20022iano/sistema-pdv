export interface CashBookEntry {

  /** O código do lançamento retornado apenas nas consultas */
  code: number;

  /** O valor do lançamento */
  value: number;

  /** O histórico do lançamento */
  history: string;

  /** O nome da categoria do lançamento */
  category: string;

  /** A data da operação */
  date: Date;

  /** O código da categoria do lançamento, usado apenas durante o registro de um novo lançamento */
  categoryCode: number;

}
