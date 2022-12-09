/**
 * Valores de pagamento informados em uma nova venda
 */
export interface NewSalePaymentsValues {

  /** Valor pago em dinheiro */
  cash: number;

  /** Valor pago no cartão de crédito */
  credit: number;

  /** Valor pago no cartão de débito */
  debit: number;

  /** Valor pago em outros meios */
  others: number;

  /** Troco da venda */
  change: number;

}
