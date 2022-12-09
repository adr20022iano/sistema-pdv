import {SALE_ORIGIN} from './sale-origin.enum';

export interface Sale {

  /** O código da venda */
  code: number;

  /** A data em que a venda foi realizada */
  date: Date;

  /** O valor total da venda */
  value: number;

  /** O valor recebido da venda */
  paidValue: number;

  /** O valor de troco da venda */
  saleChange: number;

  /** O nome do cliente da venda */
  customer: { name: string; code: number, nickname: string };

  /** Origem da venda */
  origin: SALE_ORIGIN;

  /** Se a venda está bloqueada para edição no aplicativo força de vendas ou não */
  locked: boolean;

  /** Nome do vendedor */
  seller: string;

}
