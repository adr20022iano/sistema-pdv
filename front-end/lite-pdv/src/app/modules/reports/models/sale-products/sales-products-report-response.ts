export interface SalesProductsReportResponse {

  /** Dados pré calculados do relatório */
  data: {

    /** Valor total das vendas */
    totalSaleValue: string;

    /** Valor total de custo dos produtos */
    totalProductsCost: string;

    /** Margem de lucro das vendas */
    profitMargin: string;

    /** Total de lucro bruto */
    profitValue: string;

    /** Markup das vendas dos produtos */
    profitMarkup: string;

    /** Total dos produtos */
    total: string;

  };

  /** Lista dos produtos */
  list: {

    /** Código do produto */
    code: number;

    /** Nome do produto */
    name: string;

    /** Código de barras do produto */
    barCode: string;

    /** Valor do produto */
    value: string;

    /** Custo do produto */
    cost: string;

    /** Quantidade do produto */
    quantity: string;

    /** Totais de lucro do produto */
    profit: string;

  }[];

}
