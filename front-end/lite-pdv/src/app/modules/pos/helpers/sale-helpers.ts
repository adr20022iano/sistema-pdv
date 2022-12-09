import Big from 'big.js';

/**
 * Calcula a porcentagem de desconto sob o valor informado.
 * @param value O valor do qual a porcentagem do desconto deve ser calculada.
 * @param discountValue O valor do desconto em reais.
 * @returns A porcentagem do valor de desconto calculada sobre o valor.
 * @private
 */
export function calculateDiscountPercentageFromValue(value: number, discountValue: number): number {
  const discountPercentage = new Big(discountValue).times(100).div(new Big(value)).toNumber();
  return Math.min(discountPercentage, 100);
}

/**
 * Calcula o valor do desconto em R$ baseado na porcentagem informada sob o valor informada.
 * @param value O valor do qual o valor de desconto será calculado.
 * @param discountPercentage A porcentagem do desconto.
 * @returns O valor de desconto calculado sobre a porcentagem de desconto do valor informado.
 * @private
 */
export function calculateDiscountValueFromPercentage(value: number, discountPercentage: number): number {
  return new Big(discountPercentage).div(100).times(new Big(value)).toNumber();
}
