import {Product} from './product';

export interface ScaleProduct extends Product {
  /** A data de validade para importação do produto na balança */
  dueDate: number;

}
