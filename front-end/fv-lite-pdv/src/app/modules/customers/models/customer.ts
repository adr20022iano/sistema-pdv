export interface Customer {

  /** Nome do cliente */
  name: string;

  /** Código do cliente */
  code: number;

  /** CPF ou CNPJ do cliente */
  cpfCnpj?: string;

  /** Telefone do cliente */
  phone?: string;

  /** Cep do cliente */
  cep?: string;

  /** Cidade e estado do cliente */
  city?: string;

  /** Endereço do cliente */
  address?: string;

  /** Bairro do cliente */
  district?: string;

  /** Número do endereço */
  number?: string;

  /** Complemento do endereço */
  complement?: string;

  /** Se o cliente possui acesso ao catálogo ou não */
  catalogAccess?: boolean;

  /** Se a venda para o cliente está bloqueada ou não */
  blockedSale?: boolean;

  /** Senha de acesso para o catálogo */
  password?: string;

  /** Apelido do cliente */
  nickname?: string;

  /** Observação do cliente */
  note?: string;

  /** E-mail do cliente */
  email?: string;

  /** O valor de débito do cliente */
  debt?: number;

}
