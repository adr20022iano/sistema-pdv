/**
 * Parâmetros da consulta do relatório de vendas.
 */
import {SALE_PAYMENT_STATUS} from '../../../pos/models/sale-payment-status.enum';

export interface SalesReportParams {

  /** Status do pagamento da venda */
  paymentStatus?: SALE_PAYMENT_STATUS;

  /** Data de início do relatório */
  startDate: Date;

  /** Data final do relatório */
  endDate: Date;

  /** Código do cliente */
  customerCode?: number;

  /** Código do vendedor */
  sellerCode?: number;

  /** Código do caixa para filtragem da venda */
  cashBookCode?: number;

}
