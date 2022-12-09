/**
 * Configurações da impressão do relatório de produtos
 */
export interface ProductsReportSettings {

  /** Se deve exibir a coluna de categorias */
  showCategory: boolean;

  /** Se deve exibir a coluna de custo */
  showCost: boolean;

  /** Se deve exibir a coluna de quantidade */
  showQuantity: boolean;

  /** Se deve exibir os totais no fim do relatório */
  showTotals: boolean;

  /** Categoria selecionada para filtrar os produtos */
  selectedCategory: string;

  /** Quantidade utilizada no filtro */
  stockFilter: number;

  /** Se está filtrando a quantidade de estoque menor ou igual ao informado via `stockFilter` */
  stockFilterAsc?: boolean;

  /** Label de disponibilidade para venda */
  saleLabel?: string;

  /** Label de disponibilidade para venda no catálogo */
  catalogSaleLabel?: string;

}
