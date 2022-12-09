import {Injectable} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  /** Precisamos armazenar o evento para exibir o prompt após o clique do usuário */
  private promptEvent: any;

  /** Se deve exibir o botão de instalação ou não */
  showInstallButton = new BehaviorSubject(false);

  constructor(private platform: Platform) {

  }

  /**
   * Inicia a função para capturar o evento de instalação assim que possível
   */
  public initPwaPrompt(): void {

    console.log('Iniciando serviço PWA');

    if (this.platform.IOS) {

      // No iOS verificamos se o app não está instalado, se não exibimos o botão de instalação
      // tslint:disable-next-line
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator['standalone']);
      if (!isInStandaloneMode) {
        this.showInstallButton.next(true);
      }

    }

    // No android, adicionamos o listener para o evento de instalação
    window.addEventListener('beforeinstallprompt', e => {

      this.showInstallButton.next(true);
      this.promptEvent = e;
      e.preventDefault();

    });

  }

  /**
   *  Emite o prompt de instalação do evento
   */
  public triggerInstallEvent(): void {
    this.promptEvent.prompt();
  }

}
