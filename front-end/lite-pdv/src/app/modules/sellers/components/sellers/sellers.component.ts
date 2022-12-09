import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {SellersService} from '../../services/sellers.service';
import {filter, takeUntil} from 'rxjs/operators';
import {NewSellerComponent} from '../new-seller/new-seller.component';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {Seller} from '../../models/seller';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'lpdv-sellers',
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.scss']
})
export class SellersComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Vendedores exibidos no componente */
  sellers = new BehaviorSubject<Seller[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  constructor(private sellersService: SellersService, private router: Router, private snackBar: DcSnackBar,
              private sideMenu: DcSideMenu, private dialog: DcDialog, private clipBoard: Clipboard) {

    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        // Carrega os vendedores
        this.loadSellers();

      });

  }

  ngOnInit(): void {

  }

  /**
   * Abre a janela para adicionar um novo vendedor
   */
  newSeller() {

    this.sideMenu.open(NewSellerComponent, {autoFocus: false}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((shouldReload: boolean) => {

      if (shouldReload) {
        this.loadSellers();
      }

    });

  }

  /**
   * Edita o vendedor selecionado
   * @param seller Vendedor selecionado para edição
   */
  editSeller(seller: Seller) {

    this.sideMenu.open(NewSellerComponent, {data: seller, autoFocus: false}).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((shouldReload: boolean) => {

        if (shouldReload) {
          this.loadSellers();
        }

      });

  }

  /**
   * Deleta o vendedor informado
   * @param seller Vendedor selecionado para exclusão
   */
  deleteSeller(seller: Seller) {

    const dlgConfig: ConfirmationDlgConfig = new ConfirmationDlgConfig(
      'Excluir vendedor?',
      seller.name,
      '1 - Ao excluir um vendedor ele será removido do registro das vendas, porém as vendas serão mantidas.',
      'Excluir', 'Cancelar', true, false, '2 - Todos os orçamentos do vendedor serão excluídos.'
    );

    // Abre a janela de confirmação
    this.dialog.open(ConfirmationDlgComponent, {data: dlgConfig}).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        // Envia a requisição para deletar o vendedor
        this.sellersService.deleteSeller(seller.code).pipe(takeUntil(this.unsub)).subscribe(() => {

          this.snackBar.open('Vendedor excluído.', null, {duration: 3500, panelClass: 'sucesso'});
          this.loadSellers();

        });

      }

    });

  }

  /**
   * Copia o código de acesso de um vendedor
   * @param seller O código do vendedor
   */
  copySellerCode(seller: Seller): void {

    if (this.clipBoard.copy(seller.externalSalesCode)) {
      this.snackBar.open('Código de acesso copiado.', null, {duration: 3500, panelClass: 'sucesso'});
    }

  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Função trackBy para listagem
   */
  sellersTrackBy(index: number, item: Seller) {
    return item.code;
  }

  /**
   * Carrega a lista de vendedores
   */
  private loadSellers() {

    this.status.next('carregando');
    this.sellersService.getSellers().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.sellers.next(response);
      this.checkResults();

    }, () => {

      this.status.next('vazio');

    });

  }

  /**
   * Retorna o novo status para o loader
   */
  private checkResults(): void {
    this.status.next(this.sellers.getValue().length > 0 ? 'pronto' : 'vazio');
  }

}
