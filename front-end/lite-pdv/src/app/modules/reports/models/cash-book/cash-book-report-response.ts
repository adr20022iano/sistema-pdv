/**
 * Resposta da consulta do relatório do caixa
 */
export interface CashBookReportResponse {

  data: {
    totalValue: string;
  };

  /** Lista dos lançamentos do caixa */
  list: {

    /** Código do lançamento */
    code: number;

    /** Data do lançamento */
    date: string;

    /** Histórico do lançamento */
    history: string;

    /** Nome da categoria do lançamento */
    categoryName: string;

    /** Valor do lançamento */
    value: number;

    /** Tipo do caixa onde o lançamento foi realizado */
    cashBookName: string;

  }[];
}
