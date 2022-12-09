import {jsPDF} from 'jspdf';
import autoTable, {Styles, UserOptions} from 'jspdf-autotable';

export interface PdfTableColumn {
  header: string;
  dataKey: string;
}

export type PdfTableColumnStyles = { [p: string]: Partial<Styles> };
export const rightAlign: Partial<Styles> = {halign: 'right'};
export const centerAlign: Partial<Styles> = {halign: 'center'};

export class NewPdfHelper {

  /** O PDF que está sendo gerado. */
  protected doc: jsPDF;

  /** Posição inicial do conteúdo do PDF no eixo Y */
  private yPos = 10;

  /**
   * @param orientation A orientação do documento, (p) retrato, (l) paisagem.
   * @param size O tamanho do documento, a4 ou [largura / altura].
   */
  constructor(orientation: 'p' | 'l' = 'p', size: 'a4' | [number, number] = 'a4') {

    this.doc = new jsPDF({orientation, format: size, unit: 'mm'});
    this.doc.setFont('helvetica');

  }

  /**
   * Adiciona uma nova tabela no documento
   * @param options Opções da tabela
   */
  addTable(options: UserOptions): void {

    // Estilos do header/footer
    const headerFooterStyles = {
      fontSize: 8,
      textColor: '#000',
      fillColor: '#e0e0e0'
    };

    const defaultStyles = {
      lineWidth: 0.1,
      lineColor: '#000',
      textColor: '#000',
      fontSize: 8,
      cellPadding: 1,
    };

    if (!options.footStyles) {
      options.footStyles = headerFooterStyles;
    }

    if (!options.headStyles) {
      options.headStyles = {...headerFooterStyles, halign: 'center'};
    }

    if (!options.styles) {
      options.styles = defaultStyles;
    }

    options = {
      ...options,
      alternateRowStyles: {
        fillColor: false
      },
      margin: options?.margin ?? 10
    };
    autoTable(this.doc, options);
    this.yPos = (this.doc as any).lastAutoTable.finalY;

  }

  /**
   * Adiciona uma linha divisora no documento
   * @param start A posição inicial da lina no eixo X
   * @param yPos A posição da linha no eixo Y
   * @param end A posição final da lina no eixo X
   * @param dashed Se a linha deve ser tracejada ou não
   */
  addDivider(start: number, yPos: number, end?: number, dashed?: boolean): void {

    this.doc.setDrawColor('#000000');
    this.doc.setFillColor('#000000');
    const endXPos = end || this.maxXPos();

    if (dashed) {
      this.doc.setLineDashPattern([1], 0);
    }

    this.doc.line(start, yPos, endXPos, yPos);

    if (dashed) {
      this.doc.setLineDashPattern([], 0);
    }

  }

  /**
   * Retorna a posição máxima no eixo X do documento.
   */
  maxXPos(): number {
    return this.doc.internal.pageSize.getWidth() - 10;
  }

  /**
   * Retorna a URL para abrir o relatório após geração.
   */
  getFileURL(): string {

    const pdfBlob = this.doc.output('blob');
    return URL.createObjectURL(pdfBlob);

  }

  /**
   * Retorna o documento atual como um arquivo
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

  /**
   * Define a posição do eixo Y do documento.
   * @param value O novo valor do eixo Y.
   */
  setYPos(value: number): void {
    this.yPos = value;
  }

  /**
   * Retorna a posição do eixo Y do documento.
   */
  getYPos(): number {
    return this.yPos;
  }

}
