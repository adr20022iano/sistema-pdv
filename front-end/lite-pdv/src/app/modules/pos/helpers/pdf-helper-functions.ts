import {Customer} from '../../customers/models/customer';
import {SaleForPrint} from '../models/sale-for-print';

/**
 * Formata o endereço do cliente para impressão
 * @param customer O cliente da venda
 */
export function formatCustomerAddress(customer: Customer): string {

  const address = customer.address || '';
  const addressNumber = customer.number ? ', '.concat(customer.number) : '';
  const complement = customer.complement ? ', '.concat(customer.complement) : '';
  const district = customer.district ? ', '.concat(customer.district) : '';
  const cep = customer.cep ? ', '.concat(customer.cep) : '';
  const city = customer.city ? ', '.concat(customer.city) : '';
  return [address, addressNumber, complement, district, cep, city].join('');

}

/**
 * Formata o endereço da empresa para impressão
 * @param sale A venda que está sendo impressa
 */
export function formatCompanyAddress(sale: SaleForPrint): string {

  const printInfo = sale.print;
  const address = printInfo.address || '';
  const addressNumber = printInfo.number ? ', '.concat(printInfo.number) : '';
  const district = printInfo.district ? ', '.concat(printInfo.district) : '';
  const cep = printInfo.cep ? ', '.concat(printInfo.cep) : '';
  const city = printInfo.city ? ', '.concat(printInfo.city) : '';
  return [address, addressNumber, district, cep, city].join('');

}

/**
 * Retorna o tamanho final para a imagem.
 * @param srcWidth A largura original da imagem.
 * @param srcHeight A altura original da imagem.
 * @param maxWidth A largura máxima para a imagem.
 * @param maxHeight A altura máxima para a imagem.
 */

export function getImageSize(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number): { width: number, height: number } {

  if (srcWidth > maxWidth && srcWidth > srcHeight) {

    // Se a largura original é maior que a máxima, e a imagem é vertical
    // calcula a razão como a largura original dividida pela altura.
    // Como o maior valor é a altura, determina a largura como o valor máximo e calcula
    // a nova altura baseada na razão da largura
    const ratio = srcWidth / srcHeight;
    return {width: maxWidth, height: maxHeight / ratio};

  } else if (srcHeight > maxHeight && srcHeight > srcWidth) {

    // Se a altura original é maior que a máxima, e a imagem é horizontal
    // calcula a razão como a altura original dividida pela largura.
    // Como o maior valor é a largura, determina a altura como o valor máximo e calcula
    // a nova largura baseada na razão da altura
    const ratio = srcHeight / srcWidth;
    return {width: maxHeight / ratio, height: maxHeight};

  } else {

    // Se for uma imagem quadrada, ou onde nenhum dos valores supera o tamanho máximo,
    // verifica qual a menor razão para usar como fator para o cálculo dos novos tamanhos
    const ratio = Math.min(1, maxWidth / srcHeight, maxHeight / srcHeight);
    return {width: srcWidth * ratio, height: srcHeight * ratio};

  }

}
