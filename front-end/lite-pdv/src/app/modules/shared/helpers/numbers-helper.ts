export class NumbersHelper {

  /**
   * Retorna uma string do valor formatada em R$.
   * @param value O valor que será formatado.
   */
  public static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value);
  }

  /**
   * Retorna uma string do número formatado para o idioma pt-BR
   * @param value O valor que será formatado
   */
  public static formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

}
