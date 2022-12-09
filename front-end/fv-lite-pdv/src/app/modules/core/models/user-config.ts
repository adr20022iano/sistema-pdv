export interface UserConfig {

  /** Se deve exibir trabalhar com fotos dos produtos ou não */
  useProductImage: boolean;

  /** Se o usuário pode aplicar desconto nas vendas */
  sellerDiscount: boolean;

  /** Se o usuário pode excluir uma venda */
  sellerDeleteSale: boolean;

  /** Se o sistema está trabalhando com cálculo de estoque ou não */
  calculateStock: boolean;

}
