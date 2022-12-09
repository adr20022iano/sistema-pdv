export interface StockHandlingReportSettings {
  /** O produto que está sendo filtrado */
  product?: {
    code: number;
    name: string;
  };

  /** O tipo das operações que estão sendo filtradas */
  handlingOperations: string;

  /** A data de início do filtro */
  startDate: Date;

  /** A data final do filtro */
  endDate: Date;

}
