import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {BehaviorSubject, Subject} from 'rxjs';
import {Bootstrap} from '@base/models/bootstrap';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {ProductsFilter} from '../../../products/models/products-filter';
import {filter, takeUntil} from 'rxjs/operators';
import {ShoppingCartService} from '../../../cart/services/shopping-cart.service';

@Component({
  selector: 'clpdv-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('openClose', [

      state('open', style({
        maxHeight: '62px',
      })),

      state('closed', style({
        maxHeight: '0',
        overflow: 'hidden'
      })),

      transition('open <=> closed', [
        animate('0.2s ease-out')
      ])

    ])
  ]
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Se a barra de busca está visível
   */
  searchBarVisible: boolean;

  searchForm = new FormGroup({
    filter: new FormControl()
  });

  /** Se a visualização atual é mobile ou não */
  @Input() isMobile: boolean;

  /**
   * Input de busca
   */
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  /**
   * Dados de bootstrap do catálogo
   */
  @Input() bootstrap: Bootstrap;

  /**
   * Evento emitido quando o botão de toggle do drawer é clicado.
   * Retorna se deve abrir `true` ou fechar `false` o drawer.
   */
  @Output() allCategoriesClick = new EventEmitter<void>();

  /**
   * Evento emitido ao clicar no botão da conta do usuário.
   */
  @Output() userAccount = new EventEmitter<void>();

  /** Se está executando a animação de exibir ou ocultar a barra de busca */
  private animating = false;

  /** Emite um evento quando o componente é destruído para cancelar quaisquer inscrições de observables */
  private readonly unsub = new Subject<void>();

  /** Número de produtos no carrinho */
  productsInCart: BehaviorSubject<number>;

  constructor(private router: Router, private acRoute: ActivatedRoute, private shoppingCart: ShoppingCartService) {

    // Recupera o nome do produto usado na busca e o preenche no input de busca, para casos de compartilhamento de link
    this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), takeUntil(this.unsub))
      .subscribe(() => {

        const currentNameQuery = this.acRoute.snapshot.queryParamMap.get('filter');
        if (currentNameQuery) {
          this.searchForm.get('filter').setValue(currentNameQuery);
        } else {
          // Se não filtra mais pelo nome, limpamos o filtro
          this.searchForm.get('filter').reset();
        }

      });

    this.productsInCart = shoppingCart.totalProducts;

  }

  ngOnInit(): void {
    this.searchBarVisible = !this.isMobile;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Verificamos se devemos exibir a barra de busca
    this.searchBarVisible = !this.isMobile;
  }

  /**
   * Foca o campo de busca quando a animação de
   * abrir o campo de busca.
   * @param event Evento de animação do campo de busca
   */
  animationDone(event: AnimationEvent): void {

    if (this.animating) {
      this.animating = false;
    }
    if (event.fromState === 'closed' && event.toState === 'open') {
      this.searchInput.nativeElement.focus();
    }

  }

  /**
   * Toggle da barra de busca
   */
  toggleSearch(): void {

    if (this.animating) {
      return;
    }

    this.searchBarVisible = !this.searchBarVisible;
    this.animating = !this.animating;

  }

  /**
   * Realiza a busca de um produto
   */
  searchProduct(): void {

    const searchFilter = this.searchForm.getRawValue().filter;
    const filterParams: ProductsFilter = {page: 1, filter: searchFilter || undefined};
    this.router.navigate(['/products'], {queryParams: filterParams}).then();
    this.searchInput.nativeElement.blur();

  }

  ngOnDestroy(): void {

    // Emite o evento para finalizar as inscrições
    this.unsub.next();
    this.unsub.complete();

  }

}
