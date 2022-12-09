export interface Product {

  /** O código do produto. */
  code: number;

  /** O nome do produto. */
  name: string;

  /** O estoque atual do produto. */
  stock: number;

  /** A unidade de venda do produto. */
  unit: string;

  /** O valor do produto. */
  value: number;

  /** O nome da categoria do produto. */
  categoryName: string;

  /** Link da imagem do produto */
  image: {

    /** Miniatura do produto */
    m: string,

    /** Imagem para visualização em listas */
    v: string,

    /** Imagem para visualização na página de detalhes */
    f: string

  };

  /** Se o produto já foi adicionado ao carrinho, definida após a leitura do carrinho atual do cliente */
  addedToCart?: boolean;

  /** Detalhes do produto */
  catalogDetails?: string;

}
