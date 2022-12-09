import {SALE_PAYMENT_STATUS} from './sale-payment-status.enum';

export interface SalesFilter {

  /** A página da listagem */
  page?: number;

  /** Código do cliente */
  customerCode?: number;

  /** Código ou observação da venda, desabilita os outros filtros */
  codeObservation?: string;

  /** Data em que a venda foi realizada */
  date?: Date;

  /**
   * Filtra pelo status do recebimento.
   *
   * 1 - Não recebidas / parcialmente recebidas.
   * 2 - Recebidas totalmente.
   * 3 - Recebimento superior.
   */
  paymentStatus?: SALE_PAYMENT_STATUS;

  /**
   * Status de bloqueio das vendas
   *
   * 1 - Vendas liberadas para edição externa
   * 2 - Vendas bloqueadas para edição externa
   */
  locked?: 1 | 2;

}
