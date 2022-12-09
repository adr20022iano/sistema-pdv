export interface StockHandlingReportParams {

  /** Data de início do período */
  startDate: Date;

  /** Data final do período */
  endDate: Date;

  /**
   * O tipo do relatório
   * 1 — Entradas
   * 2 — Saídas
   * 3 — Perdas
   * 4 — Vendas
   * 5 — Produção
   * 6 — Transferências
   */
  type: number[];

  /** O código de um produto para filtrar somente por ele */
  productCode: number;

}
