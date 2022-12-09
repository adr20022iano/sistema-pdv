import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LoginParams} from '../models/login-params';
import {LoginResponse} from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {
  }

  /**
   * Realiza o login do usuário
   * @param dados Os dados de login do usuário
   */
  login(dados: LoginParams) {
    return this.http.post<LoginResponse>('login', JSON.stringify(dados));
  }

  /**
   * Realiza a atualização do token do usuário
   */
  public updateToken() {
    return this.http.patch<LoginResponse>('login', null);
  }

}
