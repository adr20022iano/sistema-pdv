import { SALE_PAYMENT_TYPE } from './sale-payment-type.enum';

export interface SalePayment {
  code: number;
  value: number;
  date: Date;
  type: SALE_PAYMENT_TYPE;
}
