export interface Product {
  code: number;
  name: string;
  stock: number;
  unit: string;
  value: number;
  barCode?: string;
  location?: string;
  cost?: number;

  /** O nome da categoria do produto */
  categoryName?: string;

  /** O valor de venda do produto no Força de Vendas */
  externalSaleValue: number;

  /**
   * Objeto contendo as urls da imagem do produto.
   * - m: miniatura.
   * - v: visualização normal.
   * - f: visualização em tamanho grande.
   */
  image?: { m: string, v: string, f: string };
}
