import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Bootstrap} from '../models/bootstrap';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Contact} from '@base/models/contact';

@Injectable({
  providedIn: 'root'
})
export class BootstrapService implements OnDestroy {

  catalogSettings = new BehaviorSubject<Bootstrap>(null);
  private readonly baseUrl = 'bootstrap';

  /** Emite um evento quando o componente é destruído para cancelar quaisquer inscrições de observables */
  private readonly unsub = new Subject<void>();

  constructor(private http: HttpClient) {

    this.loadSettings().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.catalogSettings.next(response);

    });

  }

  /**
   * Consulta as configurações de bootstrap do catálogo.
   */
  loadSettings(): Observable<Bootstrap> {
    return this.http.get<Bootstrap>(this.baseUrl);
  }

  /**
   * Envia uma mensagem de contato para a api.
   * @param contact A mensagem do usuário.
   */
  sendContact(contact: Contact): Observable<any> {
    return this.http.post('https://api2.devap.com.br/publica/smtp', JSON.stringify(contact));
  }

  ngOnDestroy(): void {

    // Emite o evento para finalizar as inscrições
    this.unsub.next();
    this.unsub.complete();

  }

}
