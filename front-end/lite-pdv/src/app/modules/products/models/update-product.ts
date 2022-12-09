import { NewProduct } from './new-product';

export interface UpdateProduct extends NewProduct {

  /** O código do produto que está sendo atualizado */
  code: number;

}
