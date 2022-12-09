import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService implements OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /** BehaviorSubject usado para emitir as alterações no breakpoint correspondentes à exibição do layout das janelas de diálogo. */
  private readonly mobileBPChanges: BehaviorSubject<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {

    // Inicializa os behaviour subjects
    this.mobileBPChanges = new BehaviorSubject(this.isMobileView());

    // Inicia o observer
    this.setupMediaObserver();

  }

  /**
   * Retorna um observable que emite sempre que o viewport sofre uma alteração.
   * @return `true` Se o viewport é mobile `(max-width: 960px)`, `false` se não.
   */
  public onMobileBPChanges(): BehaviorSubject<boolean> {
    return this.mobileBPChanges;
  }

  /**
   * Retorna true se a visualização atual é mobile ou não.
   * (max-width: 960px)
   */
  public isMobileView(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]);
  }

  ngOnDestroy(): void {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();
    this.mobileBPChanges.complete();

  }

  /**
   * Inicia o observable que monitora o as alterações no viewport
   */
  private setupMediaObserver(): void {

    // Observa alterações para o layout mobile
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(takeUntil(this.unsub))
      .subscribe(result => {

        if (result.matches !== this.mobileBPChanges.getValue()) {
          this.mobileBPChanges.next(result.matches);
        }

      });

  }

}
