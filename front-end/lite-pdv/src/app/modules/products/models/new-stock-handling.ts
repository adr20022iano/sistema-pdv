import { PRODUCT_HANDLING_TYPE } from './product-handling-type.enum';

export interface NewStockHandling {

  productCode: number;
  history?: string;
  quantity: number;
  type: PRODUCT_HANDLING_TYPE;
  cost?: number;
  averageCost?: boolean;

}
