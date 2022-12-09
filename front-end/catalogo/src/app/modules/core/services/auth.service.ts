import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

interface LoginResponse {
  customerName: string;
  token: string;
}

/**
 * Chave usada para identificar o token no LocalStorage
 */
const AUTH_TOKEN_STORAGE_KEY = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  /** Emite quando o login do usuário é alterado */
  private readonly loginChange = new Subject<boolean>();

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private http: HttpClient) {
  }

  /**
   * Envia a requisição de login do usuário e salva o token retornado pelo webservice.
   * @param email Email do usuário.
   * @param password Senha do usuário.
   * @param recaptchaToken Token de acesso do recaptcha.
   */
  login(email: string, password: string, recaptchaToken?: string): Observable<LoginResponse> {

    return this.http.post<LoginResponse>('login', JSON.stringify({email, password, recaptcha: recaptchaToken})).pipe(tap(response => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, JSON.stringify(response));
      this.loginChange.next(true);
    }));

  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    this.loginChange.next(false);
  }

  /**
   * Retorna um observable que emite quando o usuário acessa ou sai do sistema.
   */
  onLoginChange(): Observable<boolean> {
    return this.loginChange.asObservable();
  }

  /**
   * Retorna o token de acesso do usuário.
   */
  getUserToken(): string | undefined {
    const userToken: LoginResponse = JSON.parse(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    return userToken?.token;
  }

  /**
   * Retorna o nome do cliente atual.
   */
  getUserName(): string {
    const userToken: LoginResponse = JSON.parse(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    return userToken?.customerName;
  }

  /**
   * Retorna se o usuário está logado.
   */
  isLoggedIn(): boolean {
    const userToken: LoginResponse = JSON.parse(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    return userToken?.token?.length > 0;
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();
    this.loginChange.complete();

  }

}
