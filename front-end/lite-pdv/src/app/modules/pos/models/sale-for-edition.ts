import {SaleProduct} from './sale-product';

export interface SaleForEdition {

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

  /** Código do vendedor da venda */
  seller: { code: number; name: string, externalSalesCode: string };

  /** Cliente da venda */
  customer: { code: number; name: string };

  /** Observação da venda */
  observation: string;

  /** Array de produtos da venda */
  products: SaleProduct[];

  /** Código da venda (apenas para salvar edições) */
  code: number;

}
