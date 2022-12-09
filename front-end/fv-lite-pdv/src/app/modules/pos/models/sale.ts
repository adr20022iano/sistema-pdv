export interface Sale {

  /** O código da venda */
  code: number;

  /** A data em que a venda foi realizada */
  date: Date;

  /** O valor total da venda */
  value: number;

  /** O valor recebido da venda */
  paidValue: number;

  /** O nome do cliente da venda */
  customer: { name: string; code: number, nickname: string };

  /** Se a venda está bloqueada para edição no força de vendas ou não */
  locked: boolean;

}
