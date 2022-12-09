import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {BehaviorSubject, Subject} from 'rxjs';
import {SaleProduct} from '../../../models/sale-product';
import {NewSaleService} from '../../../services/new-sale.service';
import {takeUntil} from 'rxjs/operators';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {EditSaleProductComponent} from '../edit-sale-product/edit-sale-product.component';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {ProductImageDlgComponent} from '../../../../shared/components/product-image-dlg/product-image-dlg.component';
import {DcDialog} from '@devap-br/devap-components/dialog';

@Component({
  selector: 'lpdv-fv-sale-products',
  templateUrl: './sale-products.component.html',
  styleUrls: ['./sale-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleProductsComponent implements OnInit, OnDestroy {

  /** O status do carregamento */
  status: BehaviorSubject<LoaderStatus> = new BehaviorSubject<LoaderStatus>('vazio');

  /** A lista dos produtos da venda */
  saleProducts: BehaviorSubject<SaleProduct[]>;

  /** Subtotal dos produtos */
  productsSubtotal: BehaviorSubject<number>;

  /** Se deve exibir ou não a miniatura dos produtos. */
  @Input() showProductImage: boolean;

  /** Se a edição dos produtos está bloqueada */
  @Input() blockEditing: boolean;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private newSaleService: NewSaleService, private snackBar: DcSnackBar, private sideMenu: DcSideMenu,
              private dialog: DcDialog) {

    // Recuperando os dados da venda que são exibidos neste componente
    this.saleProducts = newSaleService.saleProducts;
    this.productsSubtotal = newSaleService.productsSubtotal;

  }

  ngOnInit(): void {

    // Sempre que houver uma alteração na lista de produtos, realizamos a verificação se existem produtos ou não
    this.saleProducts.asObservable().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.checkStatus();
    });

  }

  /**
   * Define o status do carregamento dos produtos.
   * @param status O status do carregamento dos produtos.
   */
  public setStatus(status: LoaderStatus) {
    this.status.next(status);
  }

  /**
   * Remove um produto da venda.
   * @param productIndex Index do produto que será removido.
   * @param product O produto que será removido da venda.
   */
  public removeProduct(productIndex: number, product: SaleProduct) {

    this.newSaleService.removeProduct(productIndex, product);
    this.snackBar.open('Produto removido.', 'Desfazer', {duration: 3500, panelClass: 'sucesso'})
      .onAction().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.newSaleService.undoLastRemoval();
    });

  }

  /**
   * Abre a janela de edição de um produto, se alterações forem feitas,
   * atualiza o produto na listagem.
   * @param product O produto que foi selecionado para edição.
   * @param productIndex O index do produto na listagem.
   */
  public editProduct(productIndex: number, product: SaleProduct): void {

    // Bloqueia a abertura dos menus de interação
    this.newSaleService.blockOpeningInteractionMenus();

    this.sideMenu.open(EditSaleProductComponent, {data: product}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe((result: SaleProduct) => {

      // Desbloqueia a abertura dos menus de interação
      this.newSaleService.unlockOpeningInteractionMenus();

      if (result) {
        this.newSaleService.updateProduct(productIndex, result.quantity, result.value);
      }

    });

  }

  /**
   * Abre a visualização da miniatura de um produto
   * @param product O produto selecionado para visualização
   */
  public showProductMiniature(product: SaleProduct): void {

    if (!product.image?.f || !this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.newSaleService.blockOpeningInteractionMenus();

    this.dialog.open(ProductImageDlgComponent, {data: product, panelClass: 'product-picture-dialog'}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe(() => {
      this.newSaleService.unlockOpeningInteractionMenus();
    });

  }

  /**
   * Função trackBy para a lista dos produtos.
   */
  productsTrackBy(index: number, item: SaleProduct) {
    return item.code;
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

  /**
   * Verifica o status dos produtos exibidos no componente,
   * se não existirem itens, exibe o placeholder.
   */
  private checkStatus() {
    this.status.next(this.saleProducts.getValue().length > 0 ? 'pronto' : 'vazio');
  }

}
