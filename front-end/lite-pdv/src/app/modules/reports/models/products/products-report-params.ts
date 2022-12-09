/**
 * Parâmetros da consulta do relatório de produtos
 */
export interface ProductsReportParams {

  /**
   * Ordem da listagem dos produtos<br>
   * 0 - Nome<br>
   * 1 - Código<br>
   * 2 - Quantidade<br>
   * 3 - Custo<br>
   * 4 - Valor<br>
   */
  orderBy?: 0 | 1 | 2 | 3 | 4;

  /** Se deve ordenar em ordem decrescente */
  orderDesc?: boolean;

  /** Códigos das categorias para filtrar, obrigatório */
  categoryCode: number[];

  /** Filtra por quantidade de estoque */
  stockFilter?: number;

  /** Se deve filtrar por quantidade de estoque menor ou igual ao informado via `stockFilter` */
  stockFilterAsc?: boolean;

  /** Disponibilidade dos produtos para venda */
  sale?: boolean;

  /** Disponibilidade dos produtos para venda no catálogo */
  catalogSale?: boolean;

}
