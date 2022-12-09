import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {Directive, OnDestroy} from '@angular/core';

/**
 * Directive usada para implementar paginação nos componentes.
 * O parâmetro <T> deve ser a interface utilizada pelo filtro
 * para utilização na função de atualização dos parâmetros da url.
 */
@Directive()
export abstract class HasPaginationDirective<T> implements OnDestroy {

  /** Controla o status de desabilitado dos botões da paginação */
  previousPageDisabled = true;
  nextPageDisabled = true;

  /** Emite um evento para cancelar as novas consultas quando a paginação é alterada */
  protected newRequestUnsub = new Subject<any>();

  protected constructor(protected acRoute: ActivatedRoute, protected router: Router) {
  }

  ngOnDestroy(): void {
    this.newRequestUnsub.complete();
  }

  /**
   * Atualiza a URL incrementando ou reduzindo a paginação.
   * @param incrementPage Se deve incrementar ou reduzir a paginação
   * @protected
   */
  pageChange(incrementPage: boolean): void {

    const currentPageQuery = this.acRoute.snapshot.queryParamMap.get('page');
    const currentPage = currentPageQuery ? +currentPageQuery : 1;
    const nextPage = incrementPage ? currentPage + 1 : currentPage - 1;
    this.newRequestUnsub.next();

    // Atualiza a url
    this.router.navigate([], {
      relativeTo: this.acRoute,
      queryParams: {
        page: nextPage,
      },
      queryParamsHandling: 'merge',
    }).then();

  }

  /**
   * Define se o botão de próxima página deve estar habilitado ou não.
   * @param disabled Se o botão está desabilitado ou não.
   */
  setNextPageDisabled(disabled: boolean): void {
    this.setPreviousPageDisabled();
    this.nextPageDisabled = disabled;
  }

  /**
   * Verifica se deve ou não desabilitar o botão de desabilitado da página anterior
   */
  setPreviousPageDisabled(): void {
    const currentPageQuery = this.acRoute.snapshot.queryParamMap.get('page');
    const currentPage = currentPageQuery ? +currentPageQuery : 1;
    this.previousPageDisabled = currentPage < 2;
  }

  /**
   * Este método deve atualizar a url com os novos parâmetros da busca.
   * @param params Parâmetros para a atualização do filtro.
   * @protected
   */
  protected abstract updateUrlFilter(params?: T): void;

}

