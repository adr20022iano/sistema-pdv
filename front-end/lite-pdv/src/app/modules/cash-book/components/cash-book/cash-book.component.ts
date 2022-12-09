import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {DcCalendar} from '@devap-br/devap-components/datepicker';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {DcOverlayComponent} from '@devap-br/devap-components/overlay';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {ConfirmationDlgConfig} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from 'src/app/modules/shared/components/confirmation-dlg/confirmation-dlg.component';
import {DateHelper} from 'src/app/modules/shared/helpers/date-helper';
import {CashBookEntry} from '../../models/cash-book-entry';
import {CashBookService} from '../../services/cash-book.service';
import {NewCashBookEntryComponent} from '../new-cash-book-entry/new-cash-book-entry.component';
import {CashBookCategoriesComponent} from '../cash-book-categories/cash-book-categories.component';

@Component({
  selector: 'lpdv-cash-book',
  templateUrl: './cash-book.component.html',
  styleUrls: ['./cash-book.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashBookComponent implements AfterViewInit, OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** Lançamentos do caixa */
  entries = new BehaviorSubject<CashBookEntry[]>([]);

  /** Status da consulta */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** O saldo atual do caixa */
  balance = new BehaviorSubject<number>(0);

  /** A data máxima para o filtro */
  maxDate = new Date();

  /** Se o caixa está deletado ou não */
  deleted: boolean;

  /** A view do calendário */
  @ViewChild(DcCalendar) datePicker: DcCalendar<Date>;

  /** A view do overlay do calendário */
  @ViewChild(DcOverlayComponent) calendarOverlay: DcOverlayComponent;

  /** Se o usuário é administrador ou não */
  isAdmin: boolean;

  /** Retorna a data do filtro para exibição */
  get displayDate(): Date {
    return this.getFilterDate();
  }

  constructor(private cashBookService: CashBookService, private router: Router, private snackBar: DcSnackBar,
              private sideMenu: DcSideMenu, private authService: AuthService, private dialog: DcDialog,
              private acRoute: ActivatedRoute) {

    this.isAdmin = this.authService.isAdmin();

    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        // Carrega os lançamentos
        this.loadEntries();

      });

  }

  /**
   * Se está filtrando os lançamentos do hoje
   */
  get filteringToday() {
    return DateHelper.areSameDay(this.getFilterDate(), this.maxDate);
  }

  /** Se deve bloquear o botão de novo lançamento ou não */
  get blockNewEntry(): boolean {
    return this.deleted || !this.filteringToday;
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {

    // Já que o calendário não pode ser anexado a um botão por padrão, usamos
    // um DcCalendar em um DcOverlay. Aqui estamos inscrevendo para os eventos
    // de alteração da data, e quando uma é selecionada, fechamos o overlay
    // e carregamos os lançamentos novamente com a data atualizada.
    this.datePicker.selectedChange.pipe(takeUntil(this.unsub)).subscribe((data: Date) => {

      this.calendarOverlay.closeOverlay();

      // Navegamos para a mesma rota atualizando os parâmetros de busca, que faz com que a inscrição dos eventos do
      // router carregue a lista novamente.
      this.router.navigate([], {
        relativeTo: this.acRoute,
        queryParams: {date: DateHelper.dateToString(data)},
        queryParamsHandling: 'merge',
      }).then();

    });

  }

  /**
   * Abre a janela para realizar um novo lançamento
   */
  newEntry() {

    this.sideMenu.open(NewCashBookEntryComponent, {
      autoFocus: false
    }).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((shouldReload: boolean) => {

        if (shouldReload) {
          this.loadEntries();
        }

      });

  }

  /**
   * Deleta o lançamento informado
   * @param entryIndex Index do lançamento na lista
   * @param entry A lançamento que será deletada
   */
  deleteEntry(entryIndex: number, entry: CashBookEntry) {

    if (!this.isAdmin) {
      return;
    }

    const dlgConfig = new ConfirmationDlgConfig(
      'Excluir lançamento?',
      entry.history,
      'Esta operação não pode ser revertida.'
    );

    // Abre a janela de confirmação
    this.dialog.open(ConfirmationDlgComponent, {data: dlgConfig}).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {

        this.cashBookService.deleteEntry(entry.code).pipe(takeUntil(this.unsub)).subscribe(() => {

          const currentEntries = this.entries.getValue();
          currentEntries.splice(entryIndex, 1);
          this.entries.next(currentEntries);
          this.checkResults();
          const newBalance = this.balance.getValue() - entry.value;
          this.balance.next(newBalance);
          this.snackBar.open('Lançamento excluído.', null, {duration: 3500, panelClass: 'sucesso'});

        });

      }

    });

  }

  /**
   * Função trackBy para listagem
   */
  entriesTrackBy(index, item: CashBookEntry) {
    return item.code;
  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Abre a janela para gerenciar as categorias
   */
  categories(): void {
    this.sideMenu.open(CashBookCategoriesComponent, {autoFocus: false});
  }

  /**
   * Realiza a consulta dos lançamentos
   */
  private loadEntries() {

    this.status.next('carregando');
    this.cashBookService.loadEntries(this.getFilterDate()).pipe(takeUntil(this.unsub)).subscribe(response => {

      this.entries.next(response.list);
      this.balance.next(response.balance);
      this.checkResults();

    }, () => {

      // Define como vazio
      this.status.next('vazio');

    });

  }

  /**
   * Retorna a data de filtragem do caixa, se não informada, retorna a data atual
   * @private
   */
  private getFilterDate(): Date {

    const queryDate = this.acRoute.snapshot.queryParamMap.get('date');
    return queryDate ? DateHelper.usStringToDate(queryDate) as Date : new Date();

  }

  /**
   * Define se a consulta tem resultados ou não
   */
  private checkResults() {
    this.status.next(this.entries.getValue().length > 0 ? 'pronto' : 'vazio');
  }

}
