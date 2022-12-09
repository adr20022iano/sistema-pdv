import {SCALE_DATE_TIPE} from './scale-date-type.enum';

export interface NewProduct {

  /** O nome do produto */
  name: string;

  /** O Código de barras do produto */
  barCode?: string;

  /** O código da categoria do produto */
  categoryCode?: number;

  /** A quantidade do estoque do produto */
  stock: number;

  /** O valor de venda do produto */
  value: number;

  /** Valor de venda externa do produto */
  externalSaleValue: number;

  /** O valor de custo do produto */
  cost: number;

  /** O tipo de data enviada para a balança */
  scaleDate?: SCALE_DATE_TIPE;

  /** A data de validade do produto */
  shelfLife?: Date;

  /** A unidade de venda */
  unit: string;

  /** Se o produto é de produção própria */
  production: boolean;

  /** Se o produto está disponível para venda */
  sale: boolean;

  /** A localização do produto no estoque */
  location?: string;

  /** Se o produto está disponível para venda no catálogo ou não */
  catalogSale?: boolean;

  /**
   * A imagem do produto.
   * Possui valores diferentes de acordo com o uso da interface.
   * - Ao adicionar/editar um produto, envia a imagem em base64 para o webservice.
   * - Ao consultar um produto, retorna a url da imagem para exibição.
   */
  image: { m: string, v: string, f: string } | string;

  /** Observação do produto para uso interno no sistema */
  details?: string;

  /** Observação do produto exibida no catálogo */
  catalogDetails?: string;

}
