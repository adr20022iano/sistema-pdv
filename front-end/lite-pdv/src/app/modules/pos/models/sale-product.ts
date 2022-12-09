export interface SaleProduct {

  /** O código do produto */
  code: number;

  /** A quantidade do produto na venda */
  quantity: number;

  /** O valor do produto na venda */
  value: number;

  /** O nome do produto */
  name: string;

  /** A unidade do produto */
  unit: string;

  /** O código de barras do produto */
  barCode: string;

  /**
   * Objeto contendo as urls da imagem do produto.
   * - m: miniatura.
   * - v: visualização normal.
   * - f: visualização em tamanho grande.
   */
  image?: { m: string, v: string, f: string };

  /** A categoria do produto */
  categoryName: string;

}
