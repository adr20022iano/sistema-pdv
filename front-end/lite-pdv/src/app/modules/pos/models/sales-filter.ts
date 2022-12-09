import {SALE_PAYMENT_STATUS} from './sale-payment-status.enum';
import {SALE_ORIGIN} from './sale-origin.enum';

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
   * 1 — Não recebidas / parcialmente recebidas.
   * 2 — Recebidas totalmente.
   * 3 — Recebimento superior.
   */
  paymentStatus?: SALE_PAYMENT_STATUS;

  /** A origem da venda */
  origin?: SALE_ORIGIN;

  /**
   * Status de bloqueio das vendas
   *
   * 1 - Vendas liberadas para edição externa
   * 2 - Vendas bloqueadas para edição externa
   */
  locked?: 1 | 2;

  /** Código do vendedor */
  sellerCode?: number;

  /** Se está filtrando orçamentos ou não */
  filterQuotes?: boolean;

  /** O valor da venda */
  value?: number;

}
