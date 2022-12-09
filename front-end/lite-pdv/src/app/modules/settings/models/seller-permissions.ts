export interface SellerPermissions {

  /** Se o pagamento pode ser deletado pelo vendedor */
  sellerDeletePayment: boolean;

  /** Se o vendedor pode deletar uma venda */
  sellerDeleteSale: boolean;

  /** Se o vendedor tem acesso ao relatório de vendas básico */
  sellerSalesReport: boolean;

  /** Se o vendedor pode aplicar descontos nas vendas ou não */
  sellerDiscount: boolean;

}
