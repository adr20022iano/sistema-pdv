import {Customer} from '../../customers/models/customer';
import {RECEIPT_TYPE} from '../../settings/models/receipt-type.enum';

export interface SaleForPrint {

  /** Desconto da venda */
  discount: number;

  /** Frete da venda */
  shipping: number;

  /** Troco da venda */
  saleChange: number;

  /** O valor pago da venda */
  paidValue: number;

  /** O valor a pagar da venda */
  unpaidValue: string;

  /** O valor total da venda */
  saleTotal: number;

  /** O valor total dos produtos da venda */
  productsTotal: number;

  /** O total de itens na venda */
  itemsTotal: number;

  /** A data em que a venda foi realizada */
  date: Date;

  /** Código do vendedor da venda */
  seller: { code: number; name: string };

  /** Cliente da venda */
  customer: Customer;

  /** Observação da venda */
  observation: string;

  /** O valor total da venda somado do valor de troco previsto */
  saleTotalWithExpectedChange: number;

  /** Array de produtos da venda */
  products: {
    code: number,
    name: string,
    quantity: number,
    value: number,
    subtotal: number,
    unit: string,
  }[];

  /** Código da venda */
  code: number;

  /** Dados da empresa para impressão */
  print: {
    phone: string;
    fantasyName: string;
    document: string;
    email: string;
    address: string;
    number: string;
    city: string;
    cep: string;
    district: string;
    saleObservation: string;
    receiptType: RECEIPT_TYPE;
    couponMarginLeft: number;
    couponMarginRight: number;
  };

}
