import {jsPDF} from 'jspdf';
import autoTable, {RowInput, Styles, UserOptions} from 'jspdf-autotable';

export interface PdfTableColumn {
  header: string;
  dataKey: string;
}

export class PdfHelper {

  /** O PDF do relatório que está sendo gerado. */
  private doc: jsPDF;

  /** Posição inicial do conteúdo do PDF no eixo X */
  xPos = 10;

  /** Posição inicial do conteúdo do PDF no eixo Y */
  yPos = 10;

  /**
   * Cria o arquivo pdf e define o cabeçalho do relatório.
   * @param title O título do relatório.
   * @param subTitle O subtítulo do relatório.
   * @param startDate Data inicial do filtro do relatório.
   * @param endDate Data final do filtro do relatório.
   * @param filterLabel Label exibida logo abaixo do título.
   */
  createReport(title: string, subTitle?: string, startDate?: Date, endDate?: Date, filterLabel?: string): jsPDF {

    // Inicializando e determinando parâmetros do documento PDF
    this.doc = new jsPDF({orientation: 'l'});
    this.doc.setProperties({title, creator: 'PDV'});
    this.doc.setFont('helvetica');
    this.doc.setFontSize(12);
    this.doc.text(title, this.xPos, this.yPos);
    this.doc.setFontSize(8);

    if (filterLabel) {
      this.doc.text(filterLabel, this.xPos, this.yPos += 4);
    }

    if (subTitle) {
      this.doc.text(subTitle, this.xPos, this.yPos += 4);
    }

    if (startDate && endDate) {
      this.doc.text('Período: '.concat(startDate.toLocaleDateString(), ' - ', endDate.toLocaleDateString()), this.xPos, this.yPos += 4);
    }

    return this.doc;

  }

  createA4Receipt(title: string, saleDate: string, companyName: string) {

    // Inicializando e determinando parâmetros do documento PDF
    this.doc = new jsPDF({orientation: 'p'});
    this.doc.setProperties({title, creator: 'PDV'});
    this.doc.setFont('helvetica');
    this.doc.setFontSize(10);
    if (companyName) {
      this.setFontStyle('bold');
      this.doc.text(companyName, this.xPos, this.yPos);
      this.setFontStyle('normal');
    }
    this.addParam(title, saleDate, this.xPos, this.yPos += 4);
    this.doc.setFontSize(8);

    return this.doc;

  }

  /**
   * Adiciona uma tabela no relatório.
   * @param columnsDef Definição das colunas da tabela.
   * @param tableBody O corpo da tabela.
   * @param footerDef Definição do footer da tabela.
   * @param columnStyles Estilos das colunas da tabela.
   */
  addTable(columnsDef: PdfTableColumn[], tableBody: RowInput[], footerDef?: RowInput[],
           columnStyles?: { [p: string]: Partial<Styles> }) {

    // Estilos do header/footer
    const headerFooterStyles = {
      fontSize: 8,
      textColor: '#000',
      fillColor: '#e0e0e0'
    };

    autoTable(this.doc, {
      columns: columnsDef,
      foot: footerDef,
      showFoot: 'lastPage',
      body: tableBody,
      startY: this.yPos + 2,
      margin: 10,
      styles: {
        lineWidth: 0.1,
        lineColor: '#000',
        textColor: '#000',
        fontSize: 8,
        cellPadding: 1
      },
      headStyles: {...headerFooterStyles, halign: 'center'},
      footStyles: headerFooterStyles,
      columnStyles
    });

    // Define a posição do eixo Y com o final da tabela
    this.yPos = (this.doc as any).lastAutoTable.finalY;

    return this.doc;

  }

  /**
   * Adiciona uma nova tabela no documento
   * @param options Opções da tabela
   */
  addTableImproved(options: UserOptions): void {

    options = {
      ...options, styles: {
        lineWidth: 0.1,
        lineColor: '#000',
        textColor: '#000',
        fontSize: 8,
        cellPadding: 1
      },
      margin: 10,
      startY: this.yPos
    };
    autoTable(this.doc, options);
    this.yPos = (this.doc as any).lastAutoTable.finalY;

  }

  /**
   * Adiciona um parâmetro no cabeçalho
   * @param label Label usada para o parâmetro
   * @param desc O valor do parâmetro
   * @param xPos A posição do texto no eixo X
   * @param yPos A Posição do texto no eixo Y
   * @private
   */
  addParam(label: string, desc: string, xPos: number, yPos: number): void {

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(label, xPos, yPos);
    const leftMargin = this.doc.getTextWidth(label);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(desc, xPos + leftMargin + 2, yPos);

  }


  /**
   * Atualiza o valor da posição Y
   * @param value O valor pelo qual incrementar a posição Y
   */
  increaseYPos(value: number): void {
    this.yPos += value;
  }

  /**
   * Adiciona uma linha de texto no documento
   * @param text O texto que será adicionado
   * @param fontSize O tamanho da fonte do texto
   */
  addText(text: string, fontSize = 8): void {
    this.doc.setFontSize(fontSize);
    this.doc.text(text, this.xPos, this.yPos + fontSize / 2);
    this.doc.setFontSize(8);
    this.yPos += fontSize / 2;
  }

  /**
   * Adiciona uma linha divisora no relatório
   */
  addLine(): void {
    this.doc.line(this.xPos, this.yPos + 2, this.doc.internal.pageSize.getWidth() - 10, this.yPos + 2);
    this.yPos += 2;
  }

  /**
   * Abre o relatório em uma nova guia.
   */
  openInNewTab(): void {

    const pdfBlob = this.doc.output('blob');
    const fileURL = URL.createObjectURL(pdfBlob);
    window.open(fileURL, '_blank');

  }

  /**
   * Retorna o pdf atual como um arquivo
   * @param fileName O nome do arquivo que será retornado
   */
  toFile(fileName: string): File {

    const pdfBlob = this.doc.output('arraybuffer');
    return new File([pdfBlob], fileName, {type: 'application/pdf'});

  }

  /**
   * Define o estilo da fonte do documento
   */
  setFontStyle(fontStyle: 'bold' | 'normal' | 'italic'): void {
    this.doc.setFont('helvetica', fontStyle);
  }

  /**
   * Salva o arquivo pdf atual
   * @param fileName O nome do arquivo
   */
  save(fileName: string): void {
    this.doc.save(fileName);
  }

}
