import {HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {Observable, throwError} from 'rxjs';
import {catchError, timeout} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {catalogParams} from '../catalog-params';
import {AuthService} from '@core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  /** Tempo para timeout, 25 segundos */
  private readonly DEFAULT_TIMEOUT_TIME = 25000;

  constructor(private snackBar: DcSnackBar, private authService: AuthService) {
  }

  /**
   * Atualiza o endereço de uma requisição com o endereço do webservice
   * @param reqUrl Endpoint da api
   */
  private static updateUrl(reqUrl: string): string {

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
          // this.authService.logout();

        } else if (error.status >= 500) {

          // Erro algum outro erro no servidor
          this.snackBar.open(error.statusText.concat(' - ', error.status.toString()), null, {duration: 5000, panelClass: 'snackbar-error'});

        }

        // Erro algum outro erro no servidor
        this.snackBar.open(error.error.msg, null, {duration: 5000, panelClass: 'snackbar-error'});

      } else if (error.name === 'TimeoutError') {

        // Se ocorrer um timeout exibe a snackbar
        this.snackBar.open(
          'O servidor está demorando muito a responder, tente novamente em alguns instantes.',
          null,
          {duration: 5000, panelClass: 'snackbar-error'});

      }

      // Loga e retorna o erro emitido
      console.error(error);
      return throwError(error);

    }));

  }

  /**
   * Retorna os headers para a requisição
   * @param smtp Se o header que deve retornar é o utilizado para requisições para a api de smtp.
   */
  private getHeaders(smtp?: boolean): HttpHeaders {

    if (smtp) {

      return new HttpHeaders({
        Authorization: 'Bearer '.concat(catalogParams.smtpToken)
      });

    }

    // Recupera o token de autenticação ou string vazia se o token for inválido
    const authToken = this.authService.getUserToken() ?? catalogParams.baseToken;

    return new HttpHeaders({
      Authorization: 'Bearer '.concat(authToken)
    });

  }

  /**
   * Atualiza a requisição com a url da api e o token de autorização
   * @param request Requisição que será atualizada
   */
  private updateRequest(request: HttpRequest<any>): HttpRequest<any> {

    // Verifica se é uma mensagem de suporte
    const contactRequest = request.url.startsWith('https://api2.devap.com.br/publica/smtp');

    if (contactRequest) {

      return request.clone({
        headers: this.getHeaders(true)
      });

    }

    return request.clone({
      url: InterceptorService.updateUrl(request.url),
      headers: this.getHeaders()
    });

  }

}
