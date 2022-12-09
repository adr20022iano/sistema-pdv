export interface CustomerOrder {

  /** O código do pedido do cliente */
  code: number;

  /** A data do pedido */
  date: Date;

  /** Valor do pedido */
  value: number;

  /** Valor já pago do pedido */
  paidValue: number;

}
