import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService implements OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** BehaviorSubject usado para emitir as alterações no breakpoint correspondentes à exibição do layout das janelas de diálogo. */
  private mobileBPChanges: BehaviorSubject<boolean>;

  /** BehaviorSubject usado para emitir as alterações no breakpoint correspondentes à exibição do layout dos AutoCompletes. */
  private handsetBPChanges: BehaviorSubject<boolean>;

  /** BehaviorSubject usado para emitir as alterações no breakpoint correspondentes à exibição do SideNav. */
  private sideNavBPChanges: BehaviorSubject<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {

    // Inicializa os behaviour subjects
    this.mobileBPChanges = new BehaviorSubject(this.isMobileView());
    this.sideNavBPChanges = new BehaviorSubject(this.allowsFixedSideNav());
    this.handsetBPChanges = new BehaviorSubject(this.isMobilePortrait());

    // Inicia o observer
    this.setupMediaObserver();

  }

  /**
   * Retorna um observable que emite sempre que o viewport sofre uma alteração.
   * @return `true` Se o viewport é mobile `(max-width: 960px)`, `false` se não.
   */
  public onMobileBPChanges(): Observable<boolean> {
    return this.mobileBPChanges.asObservable();
  }

  /**
   * Retorna um observable que emite sempre que o viewport sofre uma alteração.
   * @return `true` Se o viewport suporta a exibição do sideNav `(min-width: 1280px)`, `false` se não.
   */
  public onSideNavBPChanges(): Observable<boolean> {
    return this.sideNavBPChanges.asObservable();
  }

  /**
   * Retorna um observable que emite sempre que o viewport sofre uma alteração.
   * @return `true` Se o viewport suporta é mobile e modo retrato `(max-width: 599.98px) and (orientation: portrait)`, `false` se não.
   */
  public handSetChanges(): Observable<boolean> {
    return this.handsetBPChanges.asObservable();
  }

  /**
   * Retorna true se a visualização atual é mobile ou não.
   * (max-width: 960px)
   */
  public isMobileView(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]);
  }

  /**
   * Retorna true se a visualização atual suporta o sideNav fixo.
   * (min-width: 1280px)
   */
  public allowsFixedSideNav(): boolean {
    return this.breakpointObserver.isMatched(['(min-width: 1280px)']);
  }

  /**
   * Retorna true se a visualização atual é mobile em modo retrato ou não.
   * (max-width: 599.98px) and (orientation: portrait)
   */
  public isMobilePortrait() {
    return this.breakpointObserver.isMatched([Breakpoints.HandsetPortrait]);
  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();
    this.mobileBPChanges.complete();
    this.sideNavBPChanges.complete();
    this.handsetBPChanges.complete();

  }

  /**
   * Inicia o observable que monitora o as alterações no viewport
   */
  private setupMediaObserver() {

    // Observa alterações para o layout mobile
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(takeUntil(this.unsub))
      .subscribe(result => {

        if (result.matches !== this.mobileBPChanges.getValue()) {
          this.mobileBPChanges.next(result.matches);
        }

      });

    // Observa alterações para exibição do SideNav
    this.breakpointObserver.observe(['(min-width: 1280px)']).pipe(takeUntil(this.unsub)).subscribe(result => {

      if (result.matches !== this.sideNavBPChanges.getValue()) {
        this.sideNavBPChanges.next(result.matches);
      }

    });

    // Observa alterações para o layout dos autocompletes
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait]).pipe(takeUntil(this.unsub)).subscribe(result => {

      if (result.matches !== this.handsetBPChanges.getValue()) {
        this.handsetBPChanges.next(result.matches);
      }

    });

  }

}
