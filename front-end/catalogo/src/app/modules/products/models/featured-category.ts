import {Product} from './product';

export interface FeaturedCategory {

  /** O nome da categoria. */
  name: string;

  /** O código da categoria. */
  code: number;

  /** Lista de produtos destacados. */
  products: Product[];

}
