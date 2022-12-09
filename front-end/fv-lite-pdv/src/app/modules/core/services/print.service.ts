import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  /** Se está imprimindo algo ou não */
  public isPrinting = false;

  constructor(private router: Router) {
  }

  /**
   * Realiza a impressão de uma venda.
   * @param saleCode O código da venda que será impresso.
   * @param numberOfCopies O número de cópias para a impressão
   */
  printSale(saleCode: number, numberOfCopies?: number) {

    this.isPrinting = true;
    this.router.navigate(['/', {
        outlets: {
          print: ['sale-receipt', saleCode]
        }
      }],
      {
        queryParams: {
          copies: numberOfCopies
        }
      }).then();

  }

  /**
   * Realiza a impressão de um relatório.
   */
  printReport(path: string) {
    this.isPrinting = true;
    this.router.navigate(['/', {outlets: {print: [path]}}]).then();
  }

  /**
   * Função que que realiza a impressão.
   * Deve ser chamada no componente de exibição assim que os dados forem carregados.
   */
  onDataReady() {
    window.print();
  }

  /**
   * Fecha a navegação do outlet de impressão.
   */
  onPrintError() {
    this.isPrinting = false;
    this.router.navigate([{outlets: {print: null}}]).then();
  }

}
