export interface CompanyDetails {

  /** Nome da empresa */
  name: string;

  /** Nome fantasia */
  fantasyName: string;

  /** CPF ou CNPJ da empresa */
  document: string;

  /** Telefone */
  phone: string;

  /** Endereço */
  address: string;

  /** Número */
  number: string;

  /** Complemento */
  complement: string;

  /** Bairro do endereço */
  district: string;

  /** CEP */
  cep: string;

  /** Endereço de e-mail da empresa */
  email: string;

  /** Cidade */
  city: string;

  /** A logo da empresa em base64 para salvar ou a url para exibição da mesma */
  image: string;

}

