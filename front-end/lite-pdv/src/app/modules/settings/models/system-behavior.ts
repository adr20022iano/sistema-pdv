import {RECEIPT_TYPE} from './receipt-type.enum';

export interface SystemBehavior {

  /** Observação exibida no cupom de venda */
  saleObservation: string;

  /** O número de cópias do recibo impresso após a venda */
  postSalePrintPagesNumber: number;

  /** A margem esquerda do cupom durante a impressão */
  couponMarginLeft: number;

  /** A margem direita do cupom durante a impressão */
  couponMarginRight: number;

  /**
   * Se o sistema está utilizando vendedor
   * 0 = Desligado, 1 = Ligado, 2 = Obrigatório
   */
  requiredSeller: 0 | 1 | 2;

  /** Se é necessário informar um cliente ao realizar uma venda */
  requiredCustomerOnSale: boolean;

  /** Se o sistema trabalha com cálculo de estoque ou não */
  calculateStock: boolean;

  /** Se deve exibir o atalho de produção de produtos ou não */
  useProduction: boolean;

  /** Se deve marcar o campo de cálculo de custo médio por padrão ao realizar entrada de estoque */
  selectedAverageCost: boolean;

  /** O tipo da impressão do cupom de venda */
  receiptType: RECEIPT_TYPE;

}

