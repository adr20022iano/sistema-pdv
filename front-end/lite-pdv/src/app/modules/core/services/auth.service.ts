import {Injectable, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LoginService} from '../../login/services/login.service';
import {DateHelper} from '../../shared/helpers/date-helper';
import {LoginResponse} from '../../login/models/login-response';
import {UserToken} from '../models/user-token';
import {UserConfig} from '../models/user-config';
import {LoginData} from '../models/login-data';

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
export class AuthService implements OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Subject usado para emitir eventos quando o login do usuário é alterado */
  private configChange: Subject<UserConfig | undefined> = new Subject();

  constructor(private router: Router, private loginService: LoginService) {
  }

  /**
   * Salva o token do usuário no localStorage.
   * @param responseToken O token retornado pela requisição de login.
   * @private
   */
  private static saveAuthToken(responseToken: string): void {
    const userToken: UserToken = {token: responseToken, exp: DateHelper.addDaysToDate(new Date(), 2)};
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, JSON.stringify(userToken));
  }

  ngOnDestroy() {

    // Cancela as inscrições dos Observables
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Retorna o token de autenticação do usuário
   *
   * @returns Token O token de autenticação do usuário ou undefined se inválido
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
   * @param loginData Os dados de login do usuário
   */
  public login(loginResponse: LoginResponse, loginData: LoginData): void {

    // Salva o token de autenticação ea as configurações do usuário
    AuthService.saveAuthToken(loginResponse.token);
    this.saveUserConfig(loginResponse.config);

    // Salvamos os dados de login para preenchimento automático na página de login
    if (loginData.rememberMe) {
      localStorage.setItem(LOGIN_DATA_STORAGE_KEY, JSON.stringify(loginData));
    } else {
      localStorage.removeItem(LOGIN_DATA_STORAGE_KEY);
    }

    // Redireciona o usuário para a página de vendas
    this.router.navigateByUrl('/sales').then();

  }

  /**
   * Retorna os dados de login salvos do usuário
   * caso a opção lembrar meu e-mail esteja ativada
   * no momento do login
   * @returns LoginData com o e-mail e a opção lembrar dados, se
   * não forem definidos no localStorage, retorna um objeto com email vazio e
   * rememberMe = false
   */
  public getLoginData(): LoginData {
    const data = localStorage.getItem(LOGIN_DATA_STORAGE_KEY);
    return data ? JSON.parse(data) as LoginData : {userName: '', rememberMe: false} as LoginData;
  }

  /**
   * Realiza o logout do usuário e redireciona para a página de login
   */
  public logout(): void {

    // Verifica se a opção lembar meu nome de usuário foi salva
    const rememberMe = this.getLoginData().rememberMe;

    // Limpa o localStorage
    this.clearLocalStorage(rememberMe);

    // Emite o evento de alteração do login
    this.configChange.next(undefined);

    // Navega para a página de login
    this.router.navigateByUrl('/login').then();

  }

  /**
   * Retorna se o token do usuário ainda é válido,
   * mas irá expirar em breve.
   *
   * @returns boolean Se deve renovar o token ou não
   */
  public shouldRenewToken(): boolean {

    const token = this.getToken();
    if (token) {

      // Se o token já estiver expirado, não iremos renová-lo,
      // pois o webservice não aceita tokens expirados para renovação
      const expired = DateHelper.isDateBefore(token.exp);
      if (expired) {
        return false;
      }

      // Verificamos se o token válido não irá expirar nos próximos 3 minutos
      const halfHourBefore = DateHelper.subMinutesFromDate(token.exp, 3);
      return DateHelper.isDateBetween(new Date(), halfHourBefore, token.exp);

    }

    return false;

  }

  /**
   * Renova o token do usuário e o salva no localstorage
   */
  public renewToken() {
    this.loginService.updateToken().pipe(takeUntil(this.unsub)).subscribe(response => {
      AuthService.saveAuthToken(response.token);
      this.saveUserConfig(response.config);
    });
  }

  /**
   * Retorna se o token do usuário existe e ainda é válido
   */
  public isLoggedIn(): boolean {
    const token = this.getToken();
    return token ? DateHelper.isDateAfter(token.exp) : false;
  }

  /**
   * Retorna se o usuário está logado como administrador ou não
   */
  public isAdmin(): boolean {
    const userConfig = this.getUserConfig();
    return userConfig ? userConfig.admin : false;
  }

  /**
   * Observable emitido quando o usuário altera seu login
   * tanto quando ele entra ou sai do sistema
   * @returns Um observable contendo o Token quando o
   * usuário acessa o sistema, ou undefined quando ele sai do sistema
   */
  public onConfigChange(): Observable<UserConfig | undefined> {
    return this.configChange.asObservable();
  }

  /**
   * Remove os dados do usuário do LocalStorage
   * exceto o tema selecionado do aplicativo.
   *
   * @param keepLoginData Se deve manter o email do usuário salvo
   * ou remove-lo
   */
  private clearLocalStorage(keepLoginData: boolean): void {

    // Chave dos itens que serão removidos do localstorage
    const keys = [
      AUTH_TOKEN_STORAGE_KEY,
      USER_CONFIG_STORAGE_KEY,
      ...(!keepLoginData ? [LOGIN_DATA_STORAGE_KEY] : [])
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
  private saveUserConfig(userConfig: UserConfig) {
    localStorage.setItem(USER_CONFIG_STORAGE_KEY, JSON.stringify(userConfig));
    this.configChange.next(userConfig);
  }

}
