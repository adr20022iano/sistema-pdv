import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {InputHelper} from '@devap-br/devap-components';

const ENDPOINT_VIA_CEP = 'https://viacep.com.br/ws/';

export interface CepRequest {

  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro: boolean;

}

@Injectable({
  providedIn: 'root'
})
export class CepService {

  constructor(private http: HttpClient) { }

  /**
   * Realiza a consulta de um endereço a partir
   * do cep informado
   * @param cep Cep que será consultado sem pontos ou
   * espaços
   */
  public findAddressByCEP(cep: string): Observable<HttpResponse<CepRequest>> {
    const queryCep = InputHelper.removeSpaces(cep);
    return this.http.get<CepRequest>(ENDPOINT_VIA_CEP.concat(queryCep, '/json/'), { observe: 'response' });

  }

}
