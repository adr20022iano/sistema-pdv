import { PRODUCT_HANDLING_TYPE } from './product-handling-type.enum';

export interface StockHandling {

  code: number;

  /** O código da venda desta movimentação,
   * se for diferente de 0, a movimentação está associada a uma venda e
   *  não pode ser excluída.
   */
  saleCode: number;

  history: string;
  type: PRODUCT_HANDLING_TYPE;
  date: Date;
  quantity: number;

  /** Valor de custo antes da movimentação */
  oldCost: number;

  /** Valor de custo informado na movimentação */
  cost: number;


}
