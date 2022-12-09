import { SALE_PAYMENT_TYPE } from './sale-payment-type.enum';

export interface NewSalePayment {
  saleCode: number;
  type: SALE_PAYMENT_TYPE;
  value: number;
}
