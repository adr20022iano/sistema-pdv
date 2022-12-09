export interface SalesProductsReportSettings {

  /** A data inicial do relatório */
  startDate?: Date;

  /** A data final do relatório */
  endDate?: Date;

  /** O cliente selecionado para o filtro de vendas */
  customer: { code: number; name: string; };

  /** O vendedor selecionado para o filtro */
  seller?: string;

  /** Se deve exibir margens de lucro markup */
  showProfit: boolean;

  /** Se deve exibir a coluna de custos do produto */
  showProductsCost: boolean;

  /** Se deve exibir a coluna de código de barras */
  showBarCode: boolean;

  /** Se deve exibir os totais de lucro dos produtos */
  showProductsProfit: boolean;

}
