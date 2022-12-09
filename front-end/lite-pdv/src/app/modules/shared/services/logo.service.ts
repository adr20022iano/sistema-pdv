import {Injectable, OnDestroy} from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogoService implements OnDestroy {

  /** A logo da empresa carregada após o login */
  private logo: HTMLImageElement;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private authService: AuthService) {

  }

  public init(): void {

    // Verifica se já existe uma logo para carregar, caso o usuário acesse o sistema sem realizar login
    const savedLogo = this.authService.getUserConfig()?.logo;

    if (savedLogo) {
      this.setLogo(savedLogo).then((loadedLogo) => {
        this.logo = loadedLogo;
      });
    }

    // Inscreve para as alterações do login para carregar a logo
    this.authService.onConfigChange().pipe(takeUntil(this.unsub)).subscribe(config => {

      if (!config) {
        this.clearLogo();
        return;
      }

      this.setLogo(config.logo).then((loadedLogo) => {
        this.logo = loadedLogo;
      }, (error) => console.log(error));

    });

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Retorna a logo carregada se ela existir, undefined se não
   * ou se ela ainda não carregou
   */
  public getLogo(): HTMLImageElement | undefined {
    return this.logo ?? undefined;
  }

  /**
   * Retorna uma promise que resolve quando a logo carrega.
   * @param logoUrl A url da logo.
   */
  private setLogo(logoUrl: string): Promise<HTMLImageElement> {

    return new Promise((resolve, reject) => {

      const logo = new Image();
      logo.onload = () => {
        resolve(logo);
      };

      logo.onerror = () => {
        reject('Erro ao carregar logo');
      };
      logo.src = logoUrl;

    });

  }

  /**
   * Limpa a logo
   */
  private clearLogo(): void {
    this.logo = undefined;
  }

}
