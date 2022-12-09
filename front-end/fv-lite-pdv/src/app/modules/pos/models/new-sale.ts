import {SaleProduct} from './sale-product';

export interface NewSale {

  /** Desconto da venda */
  discount: number;

  /** Frete da venda */
  shipping: number;

  /** Código do cliente da venda */
  customerCode: number;

  /** Observação da venda */
  observation: string;

  /** Array de produtos da venda */
  products: SaleProduct[];

  /** Código da venda (apenas para salvar edições) */
  code?: number;

  /** O código do orçamento no qual a venda foi baseado */
  quoteCode?: number;

}
