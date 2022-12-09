export class BarcodeHelper {

  /**
   * Calcula o dígito verificador de um código de barras EAN-13
   * @param barcode O código de barras com 12 dígitos para verificação.
   * @private
   */
  public static generateBarcodeCheckDigit(barcode: string): number {

    // Fatores para multiplicação do código de barras
    const multiply = [1, 3];

    // Total da soma dos resultados das multiplicações
    let total = 0;

    // Separamos a string do código de barras para realizar a multiplicação
    barcode.split('').forEach((letter, index) => {

      // Adicionamos ao total o resultado da multiplicação, alternando entre os fatores 1 e 3
      total += parseInt(letter, 10) * multiply[index % 2];

    });

    // O total da multiplicações deve ser dividido por 10 e arredondado para baixo
    // Em seguida multiplicamos o resultado da divisão por 10
    const base10Superior = Math.ceil(total / 10) * 10;

    // Subtraímos o total das multiplicações do total multiplicado por 10
    return base10Superior - total;
  }

}
