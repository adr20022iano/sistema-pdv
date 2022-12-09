/**
 * Interface que representa um produto adicionado ao carrinho.
 */
import {Product} from '../../products/models/product';

export interface CartProduct extends Product{
  quantity: number;
}
