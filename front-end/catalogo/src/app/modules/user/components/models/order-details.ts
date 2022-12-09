import {CartProduct} from '../../../cart/models/cart-product';

export interface OrderDetails {

  /** Código da venda */
  code: number;

  /** Valor pago da venda */
  paidValue: number;

  /** Observação da venda */
  observation: string;

  /** Data da venda */
  date: Date;

  /** Desconto da venda */
  discount: number;

  /** Frete da venda */
  shipping: number;

  /** Produtos das venda */
  products: CartProduct[];

}
