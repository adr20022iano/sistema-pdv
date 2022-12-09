import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareHelperService {
  webNavigator: any = null;

  constructor() {
    this.webNavigator = window.navigator;
  }

  /**
   * Retorna se o navegador atual suporta compartilhamento ou não.
   */
  supportsShare(): boolean {
    return this.webNavigator !== null && this.webNavigator.share !== undefined;
  }

  /**
   * Retorna se o navegador atual suporta compartilhamento de arquivos.
   * @param file Array de arquivos para compartilhamento.
   */
  canShareFile(file: File[]): boolean {
    return this.webNavigator !== null && this.webNavigator.share !== undefined && this.webNavigator.canShare({files: file});
  }

  /**
   * Compartilha os arquivos ou text informado.
   * @param shareData Objeto com os parâmetros de compartilhamento.
   */
  share(shareData: ShareObject) {

    return new Promise(async (resolve, reject) => {

      if (this.webNavigator !== null && this.webNavigator.share !== undefined) {

        if (!shareData.text && !shareData.url) {
          console.warn(`ambos text e url não podem ser vazios, forneça ao menos um dos dois.`);
        } else {

          try {

            const shareObject: ShareObject = {title: shareData.title, text: shareData.text, url: shareData.url};

            if (shareData.files && shareData.files.length !== 0) {
              shareObject.files = shareData.files;
            }

            this.webNavigator.share(shareObject);

            resolve({shared: true});

          } catch (error) {
            reject({shared: false, error});
          }

        }

      } else {
        reject({shared: false, error: `Este serviço/api não é suportado pelo seu navegador`});
      }

    });
  }

}

interface ShareObject {
  title: string;
  text?: string;
  url?: string;
  files?: any[];
}
