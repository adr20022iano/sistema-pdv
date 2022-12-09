import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {DateHelper} from '../../shared/helpers/date-helper';
import {LoginResponse} from '../../login/models/login-response';
import {UserToken} from '../models/user-token';
import {UserConfig} from '../models/user-config';

/**
 * Chave usada para identificar o token no LocalStorage
 */
const AUTH_TOKEN_STORAGE_KEY = 'token';

/**
 * Chave usada para identificar o token no LocalStorage
 */
const USER_CONFIG_STORAGE_KEY = 'config';

/**
 * Chave usada para identificar os dados de login armazenados
 */
const LOGIN_DATA_STORAGE_KEY = 'login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** Subject usado para emitir eventos quando o login do usuário é alterado */
  private configChange: Subject<UserConfig | undefined> = new Subject();

  constructor(private router: Router) {
  }

  /**
   * Salva o token do usuário no localStorage.
   * @param responseToken O token retornado pela requisição de login.
   * @private
   */
  private static saveAuthToken(responseToken: string): void {
    const userToken: UserToken = {token: responseToken};
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, JSON.stringify(userToken));
  }

  /**
   * Retorna o token de autenticação do usuário
   *
   * @returns `Token` O token de autenticação do usuário ou `undefined` se inválido
   */
  public getToken(): UserToken {

    // Recupera o token
    const localStorageToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (localStorageToken) {
      const parsedToken = JSON.parse(localStorageToken);
      parsedToken.exp = DateHelper.stringToDate(parsedToken.exp);
      return parsedToken as UserToken;
    }

    return undefined;

  }

  /**
   * Recupera as configurações do usuário
   */
  public getUserConfig(): UserConfig {

    // Recupera o token
    const localStorageConfig = localStorage.getItem(USER_CONFIG_STORAGE_KEY);

    if (localStorageConfig) {
      const parsedConfig = JSON.parse(localStorageConfig);
      return parsedConfig as UserConfig;
    }

    return undefined;

  }

  /**
   * Realiza o login do usuário e o redireciona para a página de vendas
   * @param loginResponse A resposta da requisição de login
   * @param username O nome de usuário do Lite PDV para acesso
   */
  public login(loginResponse: LoginResponse, username: string): void {

    // Salva o token de autenticação ea as configurações do usuário
    AuthService.saveAuthToken(loginResponse.token);
    AuthService.saveUserConfig(loginResponse.config);

    // Salvamos os dados de login para preenchimento automático na página de login
    localStorage.setItem(LOGIN_DATA_STORAGE_KEY, username);

    // Redireciona o usuário para a página de vendas
    this.router.navigateByUrl('/sales').then();

  }

  /**
   * Retorna o nome de usuário do Lite PDV usado para logar no sistema
   */
  public getLitePDVUserName(): string {
    return localStorage.getItem(LOGIN_DATA_STORAGE_KEY);
  }

  /**
   * Realiza o logout do usuário e redireciona para a página de login
   */
  public logout(): void {

    // Limpa o token de acesso do usuário
    this.clearLocalStorage();

    // Emite o evento de alteração do login
    this.configChange.next(undefined);

    // Navega para a página de login
    this.router.navigateByUrl('/login').then();

  }

  /**
   * Retorna se o token do usuário existe e ainda é válido
   */
  public isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== undefined;
  }

  /**
   * Remove os dados do usuário do `LocalStorage`
   * exceto nome de usuário do Lite PDV.
   */
  private clearLocalStorage(): void {

    // Chave dos itens que serão removidos do localstorage
    const keys = [
      AUTH_TOKEN_STORAGE_KEY,
      USER_CONFIG_STORAGE_KEY
    ];

    // Remove as chaves do localStorage
    keys.forEach(key => {
      localStorage.removeItem(key);
    });

  }

  /**
   * Salva as configurações do usuário e emite o evento da alteração.
   * @param userConfig As configurações do usuário
   * @private
   */
  private static saveUserConfig(userConfig: UserConfig) {
    localStorage.setItem(USER_CONFIG_STORAGE_KEY, JSON.stringify(userConfig));
  }

}
