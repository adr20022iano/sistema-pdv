import {SaleProduct} from './sale-product';

export interface NewSale {

  /** Desconto da venda */
  discount: number;

  /** Frete da venda */
  shipping: number;

  /** Valor pago em dinheiro */
  cash: number;

  /** Valor pago em cartão de crédito */
  credit: number;

  /** Valor pago em cartão de débito */
  debit: number;

  /** Valor pago usando outros meios */
  others: number;

  /** O valor de troco da venda */
  saleChange: number;

  /** Código do vendedor da venda */
  sellerCode: number;

  /** Código do cliente da venda */
  customerCode: number;

  /** Observação da venda */
  observation: string;

  /** Array de produtos da venda */
  products: SaleProduct[];

  /** Código da venda (apenas para salvar edições) */
  code?: number;

  /** O código do orçamento onde a venda foi baseado */
  quoteCode?: number;

}
