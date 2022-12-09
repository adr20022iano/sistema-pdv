import {PRODUCT_SALE_TYPE} from './product-sale-type.enum';
import {PRODUCT_TYPE} from './product-type.enum';
import {CATALOG_FILTER} from './catalog-filter.enum';

export interface ProductFilter {

  /** Nome, código de barras ou código do produto */
  name?: string;

  /** Código da categoria */
  categoryCode?: number;

  /** Se deve listar produtos disponíveis para venda, indisponíveis ou todos (Se não informado, retorna todos os produtos) */
  sale?: PRODUCT_SALE_TYPE;

  /** Se deve listar produtos de produção, normais ou todos (Se não informado, retorna todos os produtos) */
  production?: PRODUCT_TYPE;

  /** Página da listagem */
  page?: number;

  /** Se deve filtrar todos os produtos, apenas disponíveis no catálogo ou apenas os que não estão no catálogo */
  catalogSale?: CATALOG_FILTER;

}
