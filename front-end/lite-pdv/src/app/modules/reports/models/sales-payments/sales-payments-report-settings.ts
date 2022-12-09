export interface SalesPaymentsReportSettings {

  /** Data de início do relatório */
  startDate: Date;

  /** Data final do relatório */
  endDate: Date;

  /** O cliente selecionado para o filtro */
  customer: { code: number; name: string; };

  /** O tipo do pagamento para o filtro
   *  1 = Dinheiro, 2 = Cartão crédito, 3 = Cartão débito, 4 = Outros
   */
  type: 1 | 2 | 3 | 4;

}
