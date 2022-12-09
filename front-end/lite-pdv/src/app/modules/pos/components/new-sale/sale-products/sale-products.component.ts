import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {BehaviorSubject, Observable, Subject, timer} from 'rxjs';
import {SaleProduct} from '../../../models/sale-product';
import {map, takeUntil} from 'rxjs/operators';
import {AuthService} from '../../../../core/services/auth.service';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {NewSaleService} from '../../../services/new-sale.service';
import {EditSaleProductComponent} from '../edit-sale-product/edit-sale-product.component';
import {ProductImageDlgComponent} from '../../../../shared/components/product-image-dlg/product-image-dlg.component';

@Component({
  selector: 'lpdv-sale-products',
  templateUrl: './sale-products.component.html',
  styleUrls: ['./sale-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleProductsComponent implements OnInit, OnDestroy {

  /** O status do carregamento */
  readonly status: Observable<LoaderStatus>;

  /** A lista dos produtos da venda */
  readonly saleProducts: Observable<SaleProduct[]>;

  /** Subtotal dos produtos */
  readonly productsSubtotal: Observable<number>;

  /** Controla o efeito de flash do subtotal dos produtos */
  readonly blinkSubtotal = new BehaviorSubject(false);

  /** Label do contador de produtos */
  readonly numberOfProductsLabel: Observable<string>;

  /** O valor anterior dos produtos */
  private previousProductsValue;

  /** Se deve exibir ou não a miniatura dos produtos. */
  readonly showProductImage: boolean;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private authService: AuthService, private newSaleService: NewSaleService, private sideMenu: DcSideMenu,
              private snackBar: DcSnackBar, private dialog: DcDialog) {

    this.showProductImage = authService.getUserConfig()?.useProductImage;

    // Recuperando os dados da venda exibidos neste componente
    this.saleProducts = newSaleService.products();
    this.productsSubtotal = newSaleService.productsSubtotal();
    this.previousProductsValue = this.newSaleService.getProductsSubtotal();
    this.status = newSaleService.productsListStatus();

    this.numberOfProductsLabel = this.newSaleService.products()
      .pipe(map(products => {
        const numberOfProducts = products.length;
        return numberOfProducts === 1 ? numberOfProducts.toString().concat(' Produto') : numberOfProducts.toString().concat(' Produtos');
      }), takeUntil(this.unsub));

  }

  ngOnInit(): void {
    this.registerProductsValueListener();
  }

  /**
   * Remove um produto da venda.
   * @param productIndex Index do produto que será removido.
   * @param product O produto que será removido da venda.
   */
  public removeProduct(productIndex: number, product: SaleProduct) {

    this.newSaleService.removeProduct(productIndex, product);
    this.snackBar.open('Produto removido', 'Desfazer', {duration: 2500, panelClass: 'sucesso'})
      .onAction().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.newSaleService.undoLastRemoval();
    });

  }

  /**
   * Abre a janela de edição de um produto, se alterações forem feitas,
   * atualiza o produto na listagem.
   * @param product O produto selecionado para edição.
   * @param productIndex O index do produto na listagem.
   */
  public editProduct(productIndex: number, product: SaleProduct): void {

    // Bloqueia a abertura dos menus de interação
    this.newSaleService.blockOpeningInteractionMenus();

    this.sideMenu.open(EditSaleProductComponent, {data: product, autoFocus: false}).afterClosed()
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

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Registra para sempre que uma alteração no valor dos produtos ocorrer, piscar o valor total dos produtos.
   * @private
   */
  private registerProductsValueListener(): void {

    this.productsSubtotal.pipe(takeUntil(this.unsub)).subscribe((productsValue) => {
      if (productsValue !== this.previousProductsValue) {
        this.flashSubtotal();
        this.previousProductsValue = productsValue;
      }
    });

  }

  /**
   * Emite o evento para que o subtotal dos produtos pisque
   * @private
   */
  private flashSubtotal(): void {

    this.blinkSubtotal.next(true);
    timer(300).pipe(takeUntil(this.unsub)).subscribe(() => {
      this.blinkSubtotal.next(false);
    });

  }

}
