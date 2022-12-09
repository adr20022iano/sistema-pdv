export interface SalesPaymentsReportResponse {

  /** Dados pré calculados do relatório */
  data: {

    /** Valor total dos recebimentos */
    totalValue: number;
  };

  /** Lista dos recebimentos */
  list: {

    /** Código do recebimento */
    code: number;

    /** Data do recebimento */
    date: string;

    /** Valor do recebimento */
    value: string;

    /** Código da venda */
    saleCode: string;

    /** Nome do cliente */
    customerName: string;

    /** O tipo do pagamento */
    type: string;

  }[];

}
