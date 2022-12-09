import {SALE_PAYMENT_STATUS} from '../../../pos/models/sale-payment-status.enum';

export interface SalesReportSettings {

  /** O status do pagamento */
  paymentStatus?: SALE_PAYMENT_STATUS;

  /** A label do status do pagamento que está sendo filtrado */
  paymentStatusLabel?: string;

  /** A data inicial do relatório */
  startDate: Date;

  /** A data final do relatório */
  endDate: Date;

  /** O cliente selecionado para o filtro de vendas */
  customer: { code: number; name: string; };

  /** Se deve exibir margens de lucro markup */
  showProfit: boolean;

  /** Se deve exibir a coluna de custos do produto */
  showProductsCost: boolean;

  /** Se deve exibir a coluna cliente */
  showCustomerColumn: boolean;

  /** Se deve exibir os totais de lucro da venda */
  showSaleProfit: boolean;

  /** Se deve exibir a coluna de data da venda */
  showSaleDate: boolean;

}
