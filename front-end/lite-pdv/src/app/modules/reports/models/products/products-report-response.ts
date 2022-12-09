/**
 * Resposta da consulta do relatório de produtos
 */
export interface ProductsReportResponse {

  /** Dados já calculados do relatório */
  data: {

    /** Valor total de venda dos produtos */
    totalSaleValue: string;

    /** Valor total de custo dos produtos */
    totalCostValue: string;

    /** Total da quantidade de produtos */
    itemsTotal: number;

    /** Margem de lucro aproximada */
    profitMargin: string;

    /** Markup aproximado */
    profitMarkup: string;

    /** Valor de lucro aproximado */
    profitValue: string;

  };

  /** Lista dos produtos */
  list: {

    /** Código do produto */
    code: number;

    /** Nome do produto */
    name: string;

    /** Nome da categoria do produto */
    categoryName: string;

    /** Estoque atual do produto */
    stock: string;

    /** Valor de custo do produto */
    cost: string;

    /** Valor de venda do produto */
    value: string;

  }[];

}
