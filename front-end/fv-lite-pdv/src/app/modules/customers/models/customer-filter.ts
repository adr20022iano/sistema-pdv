export interface CustomersFilter {

  /** Nome para realizar a busca no filtro */
  name?: string;

  /** Nome da cidade para realizar a busca no filtro */
  city?: string;

  /** Página da listagem */
  page?: number;

  /** O número do documento do cliente */
  document?: string;

}
