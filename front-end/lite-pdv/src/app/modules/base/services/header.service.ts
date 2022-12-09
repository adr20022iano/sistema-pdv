import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Title} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  /** O título do header */
  private headerTitle = new BehaviorSubject<string>('PDV');

  /** Se deve exibir o botão de voltar */
  private backButtonURL = new BehaviorSubject('');

  constructor(private title: Title) {
  }

  /**
   * Atualiza o título do cabeçalho e do header da página
   * @param newTitle O novo título que será exibido
   */
  setTitle(newTitle: string): void {

    if (newTitle && newTitle !== this.headerTitle.getValue()) {
      this.headerTitle.next(newTitle);
    }
    this.title.setTitle(newTitle?.concat(' - PDV') || 'PDV');

  }

  /**
   * Retorna o BehaviorSubject que contém o título da página
   */
  getTitle(): BehaviorSubject<string> {
    return this.headerTitle;
  }

  /**
   * Retorna o BehaviorSubject que determina se a url de destino ao clicar no botão voltar
   */
  backButtonRoute(): BehaviorSubject<string> {
    return this.backButtonURL;
  }

  /**
   * Determina a URL de destino do botão voltar.
   */
  setBackButtonRoute(route: string) {
    this.backButtonURL.next(route);
  }

}
