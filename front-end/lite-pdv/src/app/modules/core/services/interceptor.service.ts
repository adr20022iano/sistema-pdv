import {HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {Observable, throwError} from 'rxjs';
import {catchError, timeout} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {AuthService} from './auth.service';

const VIA_CEP_ENDPOINT = 'https://viacep.com.br/ws/';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService, private snackBar: DcSnackBar) {
  }

  /** Tempo para timeout, 25 segundos */
  private readonly DEFAULT_TIMEOUT_TIME = 25000;

  /**
   * Atualiza o endereço de uma requisição com o endereço do webservice
   * @param reqUrl Endpoint da api
   */
  private static updateUrl(reqUrl: string) {

    // Verifica se o endereço da requisição já não foi definido
    if (!reqUrl.startsWith(environment.endpoint)) {

      return environment.endpoint.concat(reqUrl);

    }

    return reqUrl;

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Verifica se a requisição tem um timeout específico antes de atualizar os headers
    const requestTimeout = request.headers.get('timeout');

    // Define o timeout para a requisição
    const timeoutTime = requestTimeout !== null ? +requestTimeout : this.DEFAULT_TIMEOUT_TIME;

    // Atualiza a requisição com os headers de autenticação e a url da api
    request = this.updateRequest(request);

    return next.handle(request).pipe(timeout(timeoutTime), catchError(error => {

      // Verifica se é um erro de autenticação e se não ocorreu durante uma
      // tentativa de login ou atualização do token
      if (error instanceof HttpErrorResponse) {

        if (error.status === 401) {

          // Se for um erro 401 unauthorized, fecha a sessão do usuário e exibe a mensagem
          this.authService.logout();

        } else if (error.status >= 500) {

          // Erro algum outro erro no servidor
          this.snackBar.open(error.statusText.concat(' - ', error.status.toString()), null, {duration: 5000, panelClass: 'falha'});

        }

        // Erro algum outro erro no servidor
        this.snackBar.open(error.error.msg, null, {duration: 5000, panelClass: 'falha'});

      } else if (error.name === 'TimeoutError') {

        // Se ocorrer um timeout exibe a snackbar
        this.snackBar.open(
          'O servidor está demorando muito a responder, tente novamente em alguns instantes.',
          null,
          {duration: 5000, panelClass: 'falha'});

      }

      console.log(error);

      // Retorna o erro
      return throwError(error);

    }));

  }

  /**
   * Atualiza a requisição com a url da api e o token de autorização
   * @param request Requisição que será atualizada
   */
  private updateRequest(request: HttpRequest<any>) {

    // Verifica se é uma requisição para o endpoint de login
    const isLoginRequest = request.url.includes('login');

    // Verifica se é uma requisição do endPoint do ViaCep
    const isViaCepRequest = request.url.startsWith(VIA_CEP_ENDPOINT);

    // Se é uma requisição do via cep, não define os parâmetros do sistema
    if (isViaCepRequest) {
      return request;
    }

    // Se não é uma requisição para página de login,
    // verifica se tem que atualizar o token
    if (!isLoginRequest) {

      // Verifica se deve atualizar o token do usuário
      if (this.authService.shouldRenewToken()) {
        this.authService.renewToken();
      }

    }

    return request.clone({
      url: InterceptorService.updateUrl(request.url),
      headers: this.getHeaders()
    });

  }

  /**
   * Retorna os headers para a requisição
   */
  private getHeaders(): HttpHeaders {

    // Recupera o token
    const token = this.authService.getToken();

    // Recupera o token de autenticação ou string vazia se o token for inválido
    const authToken = token ? token.token : '';

    return new HttpHeaders({
      Authorization: 'Bearer '.concat(authToken)
    });

  }

}
