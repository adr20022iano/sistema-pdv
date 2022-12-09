import {Customer} from '../../customers/models/customer';

export interface SaleForPrint {

  /** Desconto da venda */
  discount: string;

  /** Frete da venda */
  shipping: string;

  /** Troco da venda */
  saleChange: string;

  /** O valor pago da venda */
  paidValue: string;

  /** O valor a pagar da venda */
  unpaidValue: string;

  /** O valor total da venda */
  saleTotal: string;

  /** O valor total dos produtos da venda */
  productsTotal: string;

  /** O total de itens na venda */
  itemsTotal: number;

  /** A data em que a venda foi realizada */
  date: string;

  /** Código do vendedor da venda */
  seller: { code: number; name: string };

  /** Cliente da venda */
  customer: Customer;

  /** Observação da venda */
  observation: string;

  /** Array de produtos da venda */
  products: {
    code: number,
    name: string,
    quantity: string,
    value: string,
    subtotal: string
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
    logo: string;
    couponMarginLeft: number;
    couponMarginRight: number;
  };

}
