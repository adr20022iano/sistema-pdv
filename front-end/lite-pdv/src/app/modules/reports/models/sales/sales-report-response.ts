export interface SalesReportResponse {

  /** Dados pré calculados do relatório */
  data: {

    /** Valor total das vendas */
    totalSaleValue: string;

    /** Valor total pago das vendas */
    totalPaidValue: string;

    /** Valor total não recebido das vendas */
    totalUnpaidValue: string;

    /** Valor total dos produtos */
    totalProductsCost: string;

    /** Margem de lucro das vendas */
    profitMargin: string;

    /** Total de lucro bruto */
    profitValue: string;

    /** Markup das vendas */
    profitMarkup: string;

    /** Total dos descontos */
    totalDiscount: string;

    /** Total do frete */
    totalShipping: string;

    /** Valor total pago em dinheiro */
    totalPaidCash: string;

    /** Valor total pago no cartão de crédito */
    totalPaidCredit: string;

    /** Valor total pago no cartão de débito */
    totalPaidDebit: string;

    /** Valor total pago em outros meios */
    totalPaidOthers: string;

    /** Valor recebido de vendas efetuadas fora do período do relatório */
    paymentsReceived: string;

  };

  /** Lista das vendas */
  list: {

    /** Código da venda */
    code: number;

    /** Data da venda */
    date: string;

    /** Nome do cliente */
    customerName: string;

    /** Valor da venda */
    value: string;

    /** Valor pago em dinheiro */
    cash: string;

    /** Valor pago em cartão de crédito */
    credit: string;

    /** Valor pago em cartão de débito */
    debit: string;

    /** Valor de troco da venda */
    saleChange: string;

    /** Valor pago por outros meios */
    others: string;

    /** Valor dos produtos */
    productsCost: string;

    /** Valor de desconto da venda */
    discount: string;

    /** Totais de lucro da venda */
    profit: string;

    /** Valor do frete */
    shipping: string;

  }[];

}
