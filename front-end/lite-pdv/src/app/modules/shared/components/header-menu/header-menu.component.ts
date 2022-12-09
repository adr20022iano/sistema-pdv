import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {HeaderMenuItem} from './header-menu-item';
import {Router} from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'lpdv-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderMenuComponent implements OnInit, OnDestroy {

  /** Lista de itens exibidos no  */
  @Input() itens: HeaderMenuItem[];

  /** Label de filtro exibida no menu do cabeçalho */
  @Input() filterLabel: string;

  /** A primeira opção do menu */
  firsOption: HeaderMenuItem;

  /** Lista de opções exibidas junto do botão principal */
  secondaryButtons: HeaderMenuItem[] = [];

  /** A lista de itens exibidos no menu do botão mais opções */
  extraOptions: HeaderMenuItem[] = [];

  /** Se deve exibir o botão mais opções ou não */
  showMoreOptions: boolean;

  /** O último breakpoint calculado */
  private lastBreakpoint: string;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private router: Router, private breakpointObserver: BreakpointObserver, private cdr: ChangeDetectorRef) {
  }

  /**
   * Retorna o número máximo de botões que podem ser exibidos no menu, baseado no breakpoint atual
   * @param breakpoint O breakpoint atual
   */
  private static getMaxColumnsByBreakpoint(breakpoint: string): number {

    switch (breakpoint) {

      case '(max-width: 339px)':
      case '(min-width: 340px)':
      case '(min-width: 540px)':
        return 2;

      case '(min-width: 720px)':
        return 3;

      case '(min-width: 960px)':
        return 4;

      case '(min-width: 1200px)':
        return 5;

    }

  }

  ngOnInit(): void {

    this.breakpointObserver.observe([
      '(max-width: 339px)',
      '(min-width: 340px)',
      '(min-width: 540px)',
      '(min-width: 720px)',
      '(min-width: 960px)',
      '(min-width: 1200px)'
    ]).pipe(takeUntil(this.unsub)).subscribe(state => {

      const breakpoints: { [p: string]: boolean } = state.breakpoints;
      const maxBreakpoint = Object.keys(breakpoints)[Object.values(breakpoints).lastIndexOf(true)];

      if (maxBreakpoint && maxBreakpoint !== this.lastBreakpoint) {
        this.setItens(HeaderMenuComponent.getMaxColumnsByBreakpoint(maxBreakpoint));
        this.lastBreakpoint = maxBreakpoint;
      }

    });

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Se a opção possuir uma rota, navega para ela, se não invoca a função onClick
   * @param item A opção do menu clicada
   */
  optionClick(item: HeaderMenuItem): void {

    if (item?.url) {

      this.router.navigateByUrl(item.url).then();
      return;

    }

    if (item.onClick) {
      item.onClick();
    }

  }

  /**
   * Define a exibição do menu.
   * @param columns O número máximo de botões que podem ser exibidos no layout atual.
   * @private
   */
  private setItens(columns: number): void {

    // Cria uma cópia da lista de opções
    const options = this.itens.slice();
    const numberOfOptions = options.length;

    // Recupera o primeiro item do menu
    this.firsOption = options.shift();

    // Se somente uma opção foi definida, paramos por aqui
    if (numberOfOptions === 1) {
      return;
    }

    // Se o número de opções é menor ou igual ao total de colunas, define os itens restantes como opções secundárias, se não,
    // define o máximo de itens secundários e os restantes exibe no menu Mais opções
    if (numberOfOptions <= columns) {

      this.secondaryButtons = options;
      this.showMoreOptions = false;

    } else {

      // Exibe o botão mais opções
      this.showMoreOptions = true;

      // O número máximo de opções secundárias
      const maxSecondaryOptions = columns - 2;

      // Recupera a lista de opções secundárias
      this.secondaryButtons = options.splice(0, maxSecondaryOptions);

      // Define as opções restantes no menu Mais opções
      this.extraOptions = options;

    }

    // Detecta as alterações
    this.cdr.detectChanges();

  }

}
