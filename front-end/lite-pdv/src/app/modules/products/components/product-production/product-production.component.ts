import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, Validators} from '@angular/forms';
import {DcInput} from '@devap-br/devap-components/input';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {CustomValidators} from 'src/app/modules/shared/validators/custom-validators';
import {CompositionProduct} from '../../models/composition-product';
import {Product} from '../../models/product';
import {ProductProduction} from '../../models/product-production';
import {ProductsService} from '../../services/products.service';
import {PRODUCT_TYPE} from '../../models/product-type.enum';

@Component({
  selector: 'lpdv-product-production',
  templateUrl: './product-production.component.html',
  styleUrls: ['./product-production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductProductionComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Formulário de produção */
  productionForm = new FormGroup({
    product: new FormControl('', [CustomValidators.objectKeyValidator('code', true)]),
    quantity: new FormControl('', [Validators.required, CustomValidators.zero])
  });

  /** Os produtos da composição */
  compositionProducts = new BehaviorSubject<CompositionProduct[]>([]);

  /** Lista dos produtos no autocomplete */
  autoCompleteProducts = new BehaviorSubject<Product[]>([]);

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** BehaviorSubject usado para mostrar a mensagem de erro de produto inválido */
  invalidProduct = new BehaviorSubject<boolean>(false);

  /** Referência do input do produto */
  @ViewChild('productInput') productInput: ElementRef<DcInput>;

  /** FormGroupDirective do formulário */
  @ViewChild(FormGroupDirective) productionFormDirective: FormGroupDirective;

  /** O total dos produtos na composição */
  compositionTotal = new BehaviorSubject<number>(0);

  constructor(private sideMenuRef: DcSideMenuRef<ProductProductionComponent>, @Inject(SIDE_MENU_DATA) public product: Product,
              private productService: ProductsService, private layoutService: LayoutService, private snackBar: DcSnackBar) {

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.initProductsAutoComplete();
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadCompositionProducts();
    });

  }

  /**
   * Adiciona um produto à composição.
   */
  addProduct() {

    if (this.productionForm.invalid) {
      return;
    }

    // Recuperamos os dados do produto para adicionar o produto à composição
    const product = this.productionForm.get('product').value as Product;
    const quantity = this.productionForm.get('quantity').value;

    // Antes de adicionar o item, verificamos se ele já está na listagem
    // para decidir se vamos adicioná-lo ou atualizá-lo.
    const currentItems = this.compositionProducts.getValue();
    const index = currentItems.findIndex(item => item.productCode === product.code);

    if (index > -1) {
      this.updateProduct(index, currentItems, quantity);
    } else {
      this.addNewProduct(product, currentItems, quantity);
    }

  }

  /**
   * Remove um produto da composição de produção.
   * @param productIndex Index do produto na lista.
   */
  deleteProduct(productIndex: number) {

    const currentProducts = this.compositionProducts.getValue();
    currentProducts.splice(productIndex, 1);
    this.compositionProducts.next(currentProducts);
    this.checkResults();
    this.snackBar.open('Produto removido da composição.', null, {duration: 3500, panelClass: 'sucesso'});

  }

  /**
   * Salva a produção do produto.
   */
  save() {

    const production: ProductProduction = {productCode: this.product.code, composition: this.compositionProducts.getValue()};
    this.productionForm.disable();

    this.productService.saveProduction(production).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.snackBar.open('Produção salva com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
      this.sideMenuRef.close(true);

    }, () => {
      this.productionForm.enable();
    });


  }

  /**
   * Função usada para retornar o nome do produto
   * no input do autocomplete.
   */
  dispProducts(product?: Product) {
    return product ? product.name : undefined;
  }

  /**
   * Função trackBy para os itens da lista
   */
  compositionProductsTrackBy(index: number, item: CompositionProduct) {
    return item.productionCode;
  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Adiciona um novo produto à lista da venda
   * @param selectedProduct Produto que foi selecionado no autocomplete
   * @param currentProducts Listagem atual dos produtos
   * @param productQuantity A quantidade do produto
   */
  private addNewProduct(selectedProduct: Product, currentProducts: CompositionProduct[], productQuantity: number) {

    // Monta o item de produção que será adicionado
    const item: CompositionProduct = {
      productionCode: null, productCode: selectedProduct.code,
      name: selectedProduct.name, unit: selectedProduct.unit,
      quantity: productQuantity, value: selectedProduct.value
    };
    const newProducts = [item, ...currentProducts];
    this.compositionProducts.next(newProducts);
    this.checkResults();
    this.resetForm();

  }

  /**
   * Atualiza a quantidade quando um produto já existente na venda que foi adicionado novamente
   * @param productIndex Índice do produto que será atualizado
   * @param currentProducts Lista atual dos produtos da venda
   * @param productQuantity A quantidade do produto
   */
  private updateProduct(productIndex: number, currentProducts: CompositionProduct[], productQuantity: number) {

    const productToUpdate = currentProducts[productIndex];
    const updatedProduct = Object.assign({}, productToUpdate);
    updatedProduct.quantity += productQuantity;
    currentProducts.splice(productIndex, 1, updatedProduct);
    this.compositionProducts.next(currentProducts);
    this.snackBar.open('Quantidade atualizada.', null, {duration: 3500, panelClass: 'sucesso'});
    this.checkResults();
    this.resetForm();

  }

  /**
   * Reseta o formulário
   */
  private resetForm() {
    this.productionFormDirective.resetForm();
    this.productionForm.reset({product: '', quantity: ''});
    this.productInput.nativeElement.focus();
  }

  /**
   * Realiza a consulta das categorias
   */
  private loadCompositionProducts() {

    this.productService.getCompositionProducts(this.product.code).pipe(takeUntil(this.unsub)).subscribe(response => {

      this.compositionProducts.next(response);
      this.checkResults();

    }, () => {
      this.status.next('vazio');
    });

  }

  /**
   * Inicializa o autocomplete dos produtos
   */
  private initProductsAutoComplete() {

    this.productionForm.get('product').valueChanges.pipe(debounceTime(200), takeUntil(this.unsub)).subscribe(value => {

      // Certifica-se de que está buscando uma string com 3 ou mais caracteres
      if (typeof value === 'string' && value.length >= 3) {
        this.productService.loadProducts({
          name: value,
          page: 1,
          production: PRODUCT_TYPE.NORMAL
        }).pipe(takeUntil(this.unsub)).subscribe((response) => {
          this.autoCompleteProducts.next(response);
        });
      } else if (typeof value === 'string' && value.length === 0) {
        this.autoCompleteProducts.next([]);
      }

    });

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

  /**
   * Define a exibição da lista após o carregamento ou alguma operação
   */
  private checkResults() {

    const compositionProducts = this.compositionProducts.getValue();
    this.status.next(compositionProducts.length > 0 ? 'pronto' : 'vazio');

    if (compositionProducts.length > 0) {

      const valor = compositionProducts.map(produto => produto.value * produto.quantity).reduce((previous, current) => {
        return previous + current;
      }, 0);
      this.compositionTotal.next(valor);

    }

  }

}
