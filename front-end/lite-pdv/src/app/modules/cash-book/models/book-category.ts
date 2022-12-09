export interface BookCategory {

  code: number;
  name: string;

  /** O tipo das operações da categoria (1 - Despesas | 2 - Receitas) */
  type: 1 | 2;

}
