import {UserConfig} from '../../core/models/user-config';

export interface LoginResponse {

  /**
   * Token de autenticação
   */
  token: string;

  /**
   * Parâmetros de configuração do sistema
   */
  config: UserConfig;

}
