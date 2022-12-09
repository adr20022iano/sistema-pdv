import {saveAs} from 'file-saver-es';
import {ScaleProduct} from '../../products/models/scale-product';

export class PrixUnoHelper {

  /**
   * Cria e salva o arquivo de exportação dos produtos para balança.
   * @param products Lista de produtos para salvar.
   */
  static createMGVFile(products: ScaleProduct[]): void {

    // Conteúdo do arquivo
    let content = '';

    // Valor do produto
    products.forEach(product => {

      console.log('Produto', product);

      // Departamento - 01 por padrão
      content = content.concat('01');

      // Tipo do produto (0 - Peso, 1 - Unidade, 2 - EAN 13 por peso, 3 - Venda peso glaciado,
      // 4 - Venda peso drenado, 5 - EAN 13 por unidade
      content = content.concat('0');

      // Código do produto
      content = this.addValue(content, product.code.toString(), 6, '0', 'left');

      // Valor do produto
      content = this.addValue(content, product.value.toFixed(2).replace('.', ''), 6, '0', 'left');

      // Dias para a validade do produto
      content = this.addValue(content, product.dueDate.toString(), 3, '0', 'left');

      // Nome do produto
      content = this.addValue(content, product.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z\s\d]/g, ''), 50, ' ', 'right');

      // Código info extra (ex: 000000) // Código imagem (ex: 0000) // Código nutricional (ex: 000000)
      content = this.addValue(content, '', 16, '0', 'left');

      // Impressão da data de validade (1 - sim, 0 - não)
      content = content.concat('1');

      // Impressão da data de embalagem (1 - sim, 0 - não)
      content = content.concat('1');

      // Código do fornecedor (ex: 0000) // Info do lote (ex: 000000000000) // Código EAN especial (ex: 00000000000)
      content = this.addValue(content, '', 27, '0', 'left');

      // Versão do preço
      content = content.concat('1');

      // Código som (ex: 0000) // Código tara (ex: 0000) // Código fracionador (ex: 0000) // Código extra 1 (ex: 0000)
      // Código do extra 2 (ex: 0000) // Código versão (ex: 0000) // Código EAN fornecedor (ex: 00000000000)
      // Código percentual do glaciamento (ex: 000000)
      content = this.addValue(content, '', 42, '0', 'left');

      // Sequencia de departamentos associados
      content = content.concat('|01|');

      // Terceira linha de descrição do item // Quarta linha de descrição do item
      content = this.addValue(content, '', 70, ' ', 'right');

      // Código extra 3 (ex: 000000) // Código extra 4 (ex: 000000) // Código de mídia (ex: 000000) // Preço promocional (ex: 000000)
      content = this.addValue(content, '', 24, '0', 'left');

      // SF, código fornecedor associado, solicitação de tara e sequência de balanças onde o item não estará ativo
      content = content.concat('0||0||');

      // Quebra de lina
      content = content.concat(String.fromCharCode(13, 10));

    });

    const blob = new Blob([content], {type: 'text/plain;charset=ISO-8859-1'});

    // noinspection SpellCheckingInspection
    const fileName = 'Itensmgv';
    saveAs(blob, fileName);

  }

  /**
   * Adiciona o valor informado ao conteúdo adicionando um padding do tamanho de padValue na direção especificada.
   * @param content O conteúdo ao qual o valor será adicionado.
   * @param text A string que será adicionada
   * @param maxLength O comprimento máximo da string
   * @param padValue O valor usado como padding
   * @param padDirection A direção do padding
   */
  static addValue(content: string, text: string, maxLength: number, padValue?: string, padDirection: 'left' | 'right' = 'left') {

    text = text.trim();

    if (text.length > 50) {
      text = text.substr(0, 50);
    }
    return content.concat(padDirection === 'left' ? text.padStart(maxLength, padValue) : text.padEnd(maxLength, padValue));

  }

}
