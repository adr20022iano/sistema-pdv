import {CUSTOMER_SALE} from './customer-sale.enum';
import {CUSTOMER_CATALOG} from './customer-catalog.enum';

export interface CustomersFilter {

  /** Nome para realizar a busca no filtro */
  name?: string;

  /** Nome da cidade para realizar a busca no filtro */
  city?: string;

  /** Página da listagem */
  page?: number;

  /**
   * Se deve filtrar os clientes disponíveis permitidos para venda (Se não informado, retorna todos os clientes)
   *  - 1 Apenas liberados para venda.
   *  - 2 Apenas bloqueados para venda.
   */
  sale?: CUSTOMER_SALE;

  /**
   * Se deve filtrar os clientes com acesso ao catálogo (Se não informado, retorna todos os clientes)
   *  - 1 Apenas com acesso ao catálogo.
   *  - 2 Apenas sem acesso ao catálogo.
   */
  catalog?: CUSTOMER_CATALOG;

  /** Endereço de e-mail */
  email?: string;

  /** Documento do cliente */
  document?: string;

}
