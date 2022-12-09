import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {SalePayment} from '../../../models/sale-payment';
import {Sale} from '../../../models/sale';
import {PosService} from '../../../services/pos.service';

@Component({
  selector: 'lpdv-fv-sale-payments',
  templateUrl: './sale-payments.component.html',
  styleUrls: ['./sale-payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalePaymentsComponent implements OnInit, OnDestroy {

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Lista dos lançamentos financeiros */
  payments = new BehaviorSubject<SalePayment[]>([]);

  /** Gerencia as inscrições */
  private unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<SalePaymentsComponent>, @Inject(SIDE_MENU_DATA) public sale: Sale,
              private posService: PosService, private layoutService: LayoutService) {
  }

  ngOnInit(): void {

    this.initLayoutChanges();
    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      this.loadPayments();
    });

  }

  /**
   * Função trackBy para a lista de lançamentos.
   */
  paymentsTrackBy(index: number, item: SalePayment) {
    return item.code;
  }

  ngOnDestroy(): void {
    this.unsub.next();
    this.unsub.complete();
  }

  /**
   * Realiza o carregamento dos lançamentos da conta
   */
  private loadPayments() {

    this.posService.getSalePayments(this.sale.code).pipe(takeUntil(this.unsub)).subscribe((response) => {

      this.payments.next(response);
      this.checkResults();

    }, () => {

      this.sideMenuRef.close();

    });

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults() {
    this.status.next(this.payments.getValue().length > 0 ? 'pronto' : 'vazio');
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
