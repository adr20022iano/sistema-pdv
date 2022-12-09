import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DcSideMenu, DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {
  NewCustomerComponent,
  NewCustomerSideMenuData
} from 'src/app/modules/customers/components/new-customer/new-customer.component';
import {Customer} from 'src/app/modules/customers/models/customer';
import {LayoutService} from '../../../../core/services/layout.service';
import {NewSaleService} from '../../../services/new-sale.service';
import {SelectCustomerComponent, SelectCustomerResult} from '../select-customer/select-customer.component';
import {SaleObservationComponent} from '../sale-observation/sale-observation.component';

@Component({
  selector: 'lpdv-fv-sale-extras',
  templateUrl: './sale-extras.component.html',
  styleUrls: ['./sale-extras.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleExtrasComponent implements OnInit, OnDestroy {

  /** Label do botão de finalizar a venda */
  endSaleBtnLabel = 'Finalizar venda';

  /** Título exibido no menu */
  title = 'Finalizar venda';

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<SaleExtrasComponent>, @Inject(SIDE_MENU_DATA) public newSaleService: NewSaleService,
              private sideMenu: DcSideMenu, private snackBar: DcSnackBar, private layoutService: LayoutService) {

    if (newSaleService?.editingSale) {
      this.endSaleBtnLabel = 'Salvar alterações';
      this.title = 'Salvar venda';

      if (newSaleService?.editingQuote) {
        this.endSaleBtnLabel = 'Finalizar venda';
      }

    }

  }

  ngOnInit(): void {
    this.initLayoutChanges();
  }

  /**
   * Retorna se deve exibir o botão de orçamento ou não
   */
  get showQuoteButton(): boolean {

    if (this.newSaleService.editingSale && this.newSaleService.editingQuote) {
      return true;
    } else if (!this.newSaleService.editingSale) {
      return true;
    }

  }

  /**
   * Fecha o sideMenu retornando que deve salvar
   * @param result 1 - Nova venda, 2 - Orçamento
   */
  endSale(result: number): void {

    // Verifica se o cliente foi informado
    if (!(this.newSaleService.saleCustomer.getValue()?.code > 0)) {

      this.snackBar.open('Informe um cliente para finalizar a venda.', null, {
        duration: 2000,
        panelClass: 'falha'
      });

      return;

    }

    this.sideMenuRef.close(result);

  }

  /**
   * Abre o menu para cadastrar um novo cliente
   */
  newCustomer() {

    const data: NewCustomerSideMenuData = {returnCustomer: true};
    this.sideMenu.open(NewCustomerComponent, {data}).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: Customer) => {

      if (!result) {
        return;
      }

      // Define o cliente da venda
      this.newSaleService.setSaleCustomer(result);

    });

  }

  ngOnDestroy() {

    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Abre a janela para selecionar o cliente
   */
  selectCustomer(): void {

    this.sideMenu.open(SelectCustomerComponent, {
      data: this.newSaleService.saleCustomer.getValue() ?? null,
      autoFocus: false
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: SelectCustomerResult) => {

      // Verifica se um resultado foi selecionado
      if (result) {

        // Verificamos se devemos adicionar um novo cliente ou remover o já selecionado
        if (result?.event) {

          if (result.event === 'new-customer') {

            // Abre a janela para adicionar um novo cliente
            this.newCustomer();
            return;

          } else {

            // Remove o cliente selecionado
            this.newSaleService.setSaleCustomer(undefined);
            this.newSaleService.saleCustomer.next(undefined);


            return;

          }

        }

        // Define o cliente selecionado
        const customer = result?.selectedCustomer;
        this.newSaleService.setSaleCustomer(customer);

      }

    });

  }

  /**
   * Abre a janela para editar a observação da venda
   */
  editObservation(): void {

    this.sideMenu.open(SaleObservationComponent, {
      data: this.newSaleService.saleObservation.getValue() ?? null,
      autoFocus: false
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((saleObservation: string) => {

      // Verifica se uma observação foi definida, permitindo string em branco
      if (saleObservation !== null && saleObservation !== undefined) {
        this.newSaleService.setSaleObservation(saleObservation);
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

}
