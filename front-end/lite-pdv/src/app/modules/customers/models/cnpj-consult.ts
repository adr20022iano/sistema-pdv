export interface CnpjConsult {

  /** Se o cnpj está na situação ativa ou não */
  active: boolean;

  /** O nome do cadastro do cnpj */
  name: string;

  /** O nome fantasia da empresa */
  nickname: string;

  /** O telefone da empresa */
  phone: string;

  /** O endereço de e-mail cadastrado */
  email: string;

  /** A cidade da empresa */
  city: string;

  /** O endereço da empresa */
  address: string;

  /** O número do endereço */
  number: string;

  /** O complemento do endereço */
  complement: string;

  /** O bairro do endereço */
  district: string;

  /** O CEP do endereço */
  cep: string;

  /** A atividade da empresa */
  activity: {

    /** A descrição da atividade da empresa */
    text: string;

    /** O código da atividade da empresa */
    code: string;

  };

}
