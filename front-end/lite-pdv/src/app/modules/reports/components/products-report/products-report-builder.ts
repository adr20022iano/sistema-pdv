import {ProductsReportResponse} from '../../models/products/products-report-response';
import {ProductsReportSettings} from '../../models/products/products-report-settings';
import {DateHelper} from '../../../shared/helpers/date-helper';
import {UserOptions} from 'jspdf-autotable';
import {centerAlign, PdfTableColumn, rightAlign} from '../../../shared/helpers/new-pdf-helper';
import {PdfReportHelper} from '../../../shared/helpers/pdf-report-helper';

export class ProductsReportBuilder {

  /**
   * Cria o pdf do relatório de produtos.
   * @param response Resposta do relatório retornada pelo webservice.
   * @param settings Configurações do relatório.
   * @private
   */
  public static createProductsReportPDF(response: ProductsReportResponse, settings: ProductsReportSettings): string {

    // Dados do cabeçalho do relatório
    const title = 'Relatório de Estoque '.concat(DateHelper.dateToFormattedString(new Date(), 'dd/MM/yyyy HH:mm'));
    let stockFilter;

    // Se está filtrando por quantidade de estoque ou não
    if (settings.stockFilter) {
      stockFilter = 'Filtrando produtos com estoque: '
        .concat(settings.stockFilterAsc ? 'Maior ou igual' : 'Menor ou igual', ' a ', settings.stockFilter.toLocaleString());
    }

    // Array do subtítulo
    const subTitle: string[] = [];

    // Se mais de uma ou todas as categorias foram selecionadas, define o subtítulo e se vai exibir ou não as categorias
    // baseado na escolha do usuário
    switch (settings.selectedCategory) {

      case 'Todas':
        subTitle.push('Categorias selecionadas: Todas');
        break;

      case undefined:
        break;

      default:
        subTitle.push('Categoria selecionada: '.concat(settings.selectedCategory));
        break;

    }

    // Disponibilidade de venda e catálogo
    subTitle.push('Disponibilidade de venda: '.concat(settings.saleLabel));
    if (settings.catalogSaleLabel) {
      subTitle.push('Disponibilidade no catálogo: '.concat(settings.catalogSaleLabel));
    }

    // Inicializa o helper que cria o arquivo PDF
    const reportHelper = new PdfReportHelper();
    reportHelper.addReportHeader(title, subTitle.join(' - '), null, null, stockFilter);

    reportHelper.addTable({
      ...this.createProductsReporTable(response, settings),
      startY: reportHelper.getYPos()
    });

    if (settings.showTotals) {
      reportHelper.addTable({
        ...PdfReportHelper.getReportProfitFooter(response),
        startY: reportHelper.getYPos() + 4
      });
    }

    return reportHelper.getFileURL();

  }

  /**
   * Cria a tabela do relatório de produtos
   * @param response A resposta da consulta do relatório
   * @param settings As configurações do relatório
   * @private
   */
  private static createProductsReporTable(response: ProductsReportResponse, settings: ProductsReportSettings): UserOptions {

    // Se mais de uma ou todas as categorias foram selecionadas, define o subtítulo e se vai exibir ou não as categorias
    // baseado na escolha do usuário

    let showCategoriesColumn = false;
    if (settings.selectedCategory === 'Todas' || settings.selectedCategory === undefined) {
      showCategoriesColumn = settings.showCategory;
    }

    // Definição das colunas da tabela
    const columnsDef: PdfTableColumn[] = [
      {header: 'Código', dataKey: 'code'},
      {header: 'Produto', dataKey: 'name'},
      {header: 'Categoria', dataKey: 'categoryName'},
      {header: 'Quantidade', dataKey: 'stock'},
      {header: 'Custo', dataKey: 'cost'},
      {header: 'Valor', dataKey: 'value'}
    ];

    // Remove os itens conforme as configurações de exibição
    if (!showCategoriesColumn || (showCategoriesColumn && !settings.showCategory)) {
      const index = columnsDef.findIndex(item => item.dataKey === 'categoryName');
      columnsDef.splice(index, 1);
    }

    if (!settings.showCost) {
      const index = columnsDef.findIndex(item => item.dataKey === 'cost');
      columnsDef.splice(index, 1);
    }

    if (!settings.showQuantity) {
      const index = columnsDef.findIndex(item => item.dataKey === 'stock');
      columnsDef.splice(index, 1);
    }

    const numberOfProducts = response.list.length;
    const totalLabel = numberOfProducts === 1 ? 'Produto' : 'Produtos';

    // Definição do footer da tabela
    const footerDef = [
      [
        {
          content: numberOfProducts.toString().concat(' ', totalLabel),
          styles: {halign: 'center'} as const,
        },
        {
          content: 'Totais baseados no estoque atual',
          colSpan: showCategoriesColumn ? 2 : 1,
          styles: {halign: 'center'} as const,
        },
        {
          content: response.data.itemsTotal.toString().concat('*'),
          styles: {halign: 'right'} as const
        },
        {
          content: response.data.totalCostValue,
          styles: {halign: 'right'} as const
        },
        {
          content: response.data.totalSaleValue,
          styles: {halign: 'right'} as const
        }
      ]
    ];

    // Estilos de customização das colunas
    const columnStyles = {
      code: centerAlign,
      stock: rightAlign,
      cost: rightAlign,
      value: rightAlign
    };

    return {
      columns: columnsDef,
      columnStyles,
      body: response.list,
      foot: footerDef
    };

  }

}
