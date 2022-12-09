/**
 * Parâmetros da consulta do relatório do caixa
 */
export interface CashBookReportParams {

  /** Lista dos códigos das categorias que serão usadas no relatório */
  categoryCode: number[];

  /** Data inicial do relatório */
  startDate: Date;

  /** Data final do relatório */
  endDate: Date;

  /**
   * O código do caixa, se não informado lista todos os caixas
   */
  cashBookCode?: number;

}
