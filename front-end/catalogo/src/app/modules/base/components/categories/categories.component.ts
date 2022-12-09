import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {ProductCategory} from '@base/models/product-category';

@Component({
  selector: 'clpdv-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent implements OnInit {

  /** Se o menu de categorias está aberto ou não */
  opened = false;

  /**
   * Lista de todas as categorias
   */
  @Input() allCategories: ProductCategory[];

  /**
   * Categorias em destaque
   */
  @Input() navBarCategories: ProductCategory[];

  /**
   * Se a visualização atual é mobile ou não
   */
  @Input() mobileView: boolean;

  /**
   * Evento emitido quando o botão de todas as categorias é clicado
   */
  @Output() allCategoriesClick = new EventEmitter<void>();

  constructor() {
  }

  /**
   * Adiciona a classe mobile no host
   */
  @HostBinding('class.mobile') get mobile(): boolean {
    return this.mobileView;
  }

  ngOnInit(): void {
  }

  /**
   * Função trackBy para a lista de categorias exibidas na dropdown
   * @param index Index do item
   * @param item O item da categoria
   */
  dropdownCategoriesTrackBy(index: number, item: ProductCategory): number {
    return item.code;
  }

  /**
   * Função trackBy para a lista de categorias exibidas na navBar
   * @param index Index do item
   * @param item O item da categoria
   */
  navBarCategoriesTrackBy(index: number, item: ProductCategory): number {
    return item.code;
  }

  /**
   * Alterna o menu dropdown entre aberto e fechado,
   * ou no layout mobile emite o evento para exibir o sideNav
   */
  toggleMenu(event?: KeyboardEvent): void {

    if (event) {
      event.preventDefault();
    }

    if (this.mobile) {
      this.allCategoriesClick.emit();
    } else {
      this.opened = !this.opened;
    }

  }

  /**
   * Fecha o menu dropDown
   */
  closeDropDown(): void {
    this.opened = false;
  }

}
