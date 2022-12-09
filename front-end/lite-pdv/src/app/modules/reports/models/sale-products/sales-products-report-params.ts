export interface SalesProductsReportParams {

  /** Data de início do relatório */
  startDate: Date;

  /** Data final do relatório */
  endDate: Date;

  /** Código do cliente */
  customerCode?: number;

  /** Código do vendedor */
  sellerCode?: number;

  /** Código do produto */
  productCode?: number;

}
