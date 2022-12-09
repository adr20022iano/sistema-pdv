export interface UserConfig {

  /** Se o usuário é administrador do sistema ou não */
  admin: boolean;

  /**
   * Se é obrigatório informar um vendedor no ato de uma venda
   * 0 = Desligado, 1 = Ligado, 2 = Obrigatório
   */
  requiredSeller: 0 | 1 | 2;

  /** O número de cópias do recibo da venda que devem ser impressos ao finalizar uma venda */
  postSalePrintPagesNumber: number;

  /** Se o módulo de catálogo está ativo. */
  catalogModule: boolean;

  /** Se o módulo de força de vendas está ativo. */
  externalSalesModule: boolean;

  /** Se o módulo de balança está ativo. */
  scaleIntegration: boolean;

  /** Se deve exibir trabalhar com fotos dos produtos ou não */
  useProductImage: boolean;

  /** Se o pagamento pode ser deletado pelo vendedor */
  sellerDeletePayment: boolean;

  /** Se o vendedor pode deletar uma venda */
  sellerDeleteSale: boolean;

  /** Se o vendedor pode acessar o relatório de vendas básico ou não */
  sellerSalesReport: boolean;

  /** Se deve exibir o atalho de produção de produtos ou não */
  useProduction: boolean;

  /** Se deve marcar o campo de cálculo de custo médio por padrão ao realizar entrada de estoque */
  selectedAverageCost: boolean;

  /** Se é necessário informar um cliente ao realizar uma venda */
  requiredCustomerOnSale: boolean;

  /** Se o usuário pode aplicar desconto nas vendas */
  sellerDiscount: boolean;

  /** Se o sistema está trabalhando com cálculo de estoque ou não */
  calculateStock: boolean;

  /** URL da logo da empresa */
  logo: string;

}
