import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Subject} from 'rxjs';
import {LayoutService} from '../../../../core/services/layout.service';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {Seller} from '../../../../sellers/models/seller';
import {SellersService} from '../../../../sellers/services/sellers.service';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {SaleSellerComponent} from './sale-seller/sale-seller.component';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {NewSaleService} from '../../../services/new-sale.service';

@Component({
  selector: 'lpdv-select-seller',
  templateUrl: './select-seller.component.html',
  styleUrls: ['./select-seller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSellerComponent implements OnInit, AfterViewInit, OnDestroy {

  /** Lista dos vendedores */
  sellers = new BehaviorSubject<Seller[]>([]);

  /** Código do vendedor selecionado atualmente  */
  currentSelectedSellerCode: number;

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Lista dos elementos dos vendedores exibidos */
  @ViewChildren(SaleSellerComponent) sellerComponents: QueryList<SaleSellerComponent>;

  /** Se um vendedor foi selecionado */
  readonly sellerSelected: boolean;

  /** KeyManager para a lista de vendedores */
  private keyManager: FocusKeyManager<SaleSellerComponent>;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private sideMenuRef: DcSideMenuRef<SelectSellerComponent>, private sellerService: SellersService,
              private layoutService: LayoutService, private cdr: ChangeDetectorRef, private newSaleService: NewSaleService) {

    const currentSeller = this.newSaleService.getSeller();
    this.currentSelectedSellerCode = currentSeller?.code;

    if (currentSeller) {
      this.sellerSelected = true;
    }

  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.loadSellers();

  }

  ngAfterViewInit(): void {

    // Inicializa o keyManager para a lista das cores
    this.keyManager = new FocusKeyManager(this.sellerComponents).withWrap(true);

  }

  /**
   * Função trackBy para a lista de vendedores
   */
  sellersTrackBy(index: number, item: Seller) {
    return item.code;
  }

  /**
   * Controla os eventos do teclado para gerenciar a lista
   */
  @HostListener('keydown', ['$event'])
  keyDown(event?: KeyboardEvent): void {

    // Quando a tecla enter é pressionada, selecionamos o cliente
    if (event?.key === 'Enter' || event?.key === ' ') {
      event.preventDefault();
      this.selectSeller(this.sellers.getValue()[this.keyManager.activeItemIndex]);
    } else {

      // Envia o evento para o keyManager
      this.keyManager.onKeydown(event);

    }

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Seleciona o vendedor
   * @param seller O vendedor selecionado
   */
  selectSeller(seller): void {
    this.newSaleService.setSaleSeller(seller);
    this.sideMenuRef.close();
  }

  /**
   * Remove o vendedor selecionado atualmente
   */
  removeSeller(): void {
    this.newSaleService.setSaleSeller(undefined);
    this.sideMenuRef.close();
  }

  /**
   * Realiza a leitura dos vendedores
   * @private
   */
  private loadSellers(): void {

    this.sellerService.getSellers().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.sellers.next(response);
      this.checkResults();
      if (response.length > 0) {
        this.setActiveListItem();
      }

    }, () => {
      this.sideMenuRef.close();
    });

  }

  /**
   * Define o item ativo da lista
   * @private
   */
  private setActiveListItem(): void {

    // Detectamos as alterações com o ChangeDetectorRef para que o queryList dos componentes dos vendedores, seja atualizado,
    // permitindo a leitura do primeiro item, ou de todos como um array
    this.cdr.detectChanges();

    if (this.currentSelectedSellerCode) {

      // Se um vendedor já está definido, encontramos seu índice na lista, o focamos e definimos como item ativo do ListKeyManager
      const sellerIndex = this.sellers.getValue().findIndex(seller => seller.code === this.currentSelectedSellerCode);
      if (sellerIndex >= 0) {
        this.keyManager.setActiveItem(sellerIndex);
        this.sellerComponents.toArray()[sellerIndex].focus();
      }

    } else {

      // Se nenhum vendedor foi selecionado, focamos o primeiro da lista
      this.sellerComponents.first.focus();
      this.keyManager.setActiveItem(0);

    }

  }

  /**
   * Retorna o novo status para o loader
   */
  private checkResults(): void {
    this.status.next(this.sellers.getValue().length > 0 ? 'pronto' : 'vazio');
  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

}
