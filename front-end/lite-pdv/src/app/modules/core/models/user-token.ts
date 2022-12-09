/**
 * Interface que constitui um token de acesso do usuário
 */
export interface UserToken {

  /** A string do token de autenticação do usuário */
  token: string;

  /** A data de expiração do token */
  exp: Date;

}
