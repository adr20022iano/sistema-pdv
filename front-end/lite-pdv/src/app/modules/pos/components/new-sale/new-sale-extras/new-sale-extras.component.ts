import {ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {AuthService} from '../../../../core/services/auth.service';
import {map, takeUntil} from 'rxjs/operators';
import {NewSaleService, SaleType} from '../../../services/new-sale.service';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {SaleDiscountComponent} from '../sale-discount/sale-discount.component';
import {SaleShippingComponent} from '../sale-shipping/sale-shipping.component';
import {SaleObservationComponent} from '../sale-observation/sale-observation.component';
import {SelectCustomerComponent} from '../select-customer/select-customer.component';
import {NewCustomerComponent, NewCustomerSideMenuData} from '../../../../customers/components/new-customer/new-customer.component';
import {Customer} from '../../../../customers/models/customer';
import {SelectSellerComponent} from '../select-seller/select-seller.component';

@Component({
  selector: 'lpdv-new-sale-extras',
  templateUrl: './new-sale-extras.component.html',
  styleUrls: ['./new-sale-extras.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewSaleExtrasComponent implements OnInit, OnDestroy {

  /** Label do botão de finalizar a venda */
  endSaleBtnLabel = new BehaviorSubject<string>('Finalizar venda');

  /** Se deve exibir o botão de orçamento */
  showQuoteButton = new BehaviorSubject<boolean>(true);

  /** Se o usuário pode aplicar desconto à venda ou não */
  canApplyDiscount: boolean;

  /** Se deve exibir a opção de vendedor ou não */
  showSellerOption: boolean;

  /** Se a observação da venda foi definida ou não */
  readonly observationDefined: Observable<boolean>;

  /** Se o cliente da venda foi definido ou não */
  readonly customerDefined: Observable<boolean>;

  /** Se o vendedor foi definido ou não */
  readonly sellerDefined: Observable<boolean>;

  /** O valor de desconto da venda */
  readonly saleDiscount: Observable<number>;

  /** O valor total da venda */
  readonly saleTotal: Observable<number>;

  /** O valor de frete da venda */
  readonly shipping: Observable<number>;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private authService: AuthService, private viewContainer: ViewContainerRef, private newSaleService: NewSaleService,
              private sideMenu: DcSideMenu) {

    const userConfig = this.authService.getUserConfig();
    this.canApplyDiscount = (this.authService.isAdmin() || userConfig?.sellerDiscount);
    this.showSellerOption = userConfig?.requiredSeller > 0;

    this.saleDiscount = this.newSaleService.discount();
    this.shipping = this.newSaleService.shipping();
    this.saleTotal = this.newSaleService.total();

    // Marca se a observação foi definida ou não
    this.observationDefined = this.newSaleService.observation().pipe(map(observation => {
      return observation?.length > 0;
    }));

    // Marca se o cliente foi definido ou não
    this.customerDefined = this.newSaleService.customer().pipe(map(customer => {
      return customer?.code > 0;
    }));

    // Marca se o vendedor foi definido ou não
    this.sellerDefined = this.newSaleService.seller().pipe(map(seller => {
      return seller?.code > 0;
    }));

    // Inscreve para alterações no tipo da operação da venda
    this.newSaleService.saleType().pipe(takeUntil(this.unsub)).subscribe(saleType => {
      this.setLayoutOptions(saleType);
    });


  }

  ngOnInit(): void {

  }

  /**
   * Abre a janela para editar o desconto da venda
   */
  @HostListener('document:keydown.F4')
  openDiscount(): void {

    if (!this.newSaleService.canOpenInteractionMenu() || !this.canApplyDiscount) {
      return;
    }

    this.newSaleService.blockOpeningInteractionMenus();
    this.sideMenu.open(SaleDiscountComponent, {autoFocus: false, viewContainerRef: this.viewContainer}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe(() => this.newSaleService.unlockOpeningInteractionMenus());

  }

  /**
   * Abre a janela para editar o frete da venda
   */
  @HostListener('document:keydown.F6', ['$event'])
  openShipping(event?: KeyboardEvent): void {

    event?.preventDefault();
    if (!this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.newSaleService.blockOpeningInteractionMenus();
    this.sideMenu.open(SaleShippingComponent, {autoFocus: false, viewContainerRef: this.viewContainer}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe(() => this.newSaleService.unlockOpeningInteractionMenus());

  }

  /**
   * Abre o menu para editar a observação da venda.
   */
  editObservation(): void {

    if (!this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.newSaleService.blockOpeningInteractionMenus();
    this.sideMenu.open(SaleObservationComponent, {autoFocus: false, viewContainerRef: this.viewContainer}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe(() => this.newSaleService.unlockOpeningInteractionMenus());

  }


  /**
   * Abre o menu para editar o cliente da venda.
   */
  selectCustomer(): void {

    if (!this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.newSaleService.blockOpeningInteractionMenus();
    this.sideMenu.open(SelectCustomerComponent, {autoFocus: false, viewContainerRef: this.viewContainer}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe((newCustomer: boolean) => {

      this.newSaleService.unlockOpeningInteractionMenus();

      if (newCustomer) {
        this.newCustomer();
      }

    });

  }

  /**
   * Abre o menu para editar o cliente da venda.
   */
  selectSeller(): void {

    if (!this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.newSaleService.blockOpeningInteractionMenus();
    this.sideMenu.open(SelectSellerComponent, {autoFocus: false, viewContainerRef: this.viewContainer}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe(() => this.newSaleService.unlockOpeningInteractionMenus());

  }

  /**
   * Abre o menu para cadastrar um novo cliente
   */
  private newCustomer(): void {

    this.newSaleService.blockOpeningInteractionMenus();
    const data: NewCustomerSideMenuData = {returnCustomer: true};
    this.sideMenu.open(NewCustomerComponent, {data, autoFocus: false}).afterClosed()
      .pipe(takeUntil(this.unsub)).subscribe((result: Customer) => {

      this.newSaleService.unlockOpeningInteractionMenus();
      if (!result) {
        return;
      }

      this.newSaleService.setSaleCustomer(result);

    });

  }

  /**
   * Emite o evento para finalizar a venda
   */
  @HostListener('document:keydown.F2')
  endSale(): void {

    if (!this.newSaleService.canOpenInteractionMenu()) {
      return;
    }

    this.newSaleService.save(false);

  }

  /**
   * Salva o orçamento.
   */
  saveQuote(): void {
    this.newSaleService.save(true);
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();
    this.showQuoteButton.complete();
    this.endSaleBtnLabel.complete();

  }


  /**
   * Define as opções do layout baseadas no tipo da operação.
   * @param type O tipo da operação da página de venda.
   * @private
   */
  private setLayoutOptions(type: SaleType): void {
    this.showQuoteButton.next(type !== 'edit-sale');
    this.endSaleBtnLabel.next(type === 'edit-sale' ? 'Salvar alterações' : 'Finalizar venda');
  }

}
