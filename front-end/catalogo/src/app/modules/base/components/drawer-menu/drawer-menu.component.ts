import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {ProductCategory} from '@base/models/product-category';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';

@Component({
  selector: 'clpdv-drawer-menu',
  templateUrl: './drawer-menu.component.html',
  styleUrls: ['./drawer-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawerMenuComponent implements OnInit {

  constructor(private sideMenuRef: DcSideMenuRef<DrawerMenuComponent>, @Inject(SIDE_MENU_DATA) public categories: ProductCategory[]) {
  }

  ngOnInit(): void {
  }

  /**
   * Evento executado quando uma categoria é clicada, fecha o drawer
   */
  categoryClick(categoryCode: number): void {
    this.sideMenuRef.close(categoryCode);
  }

  /**
   * Função trackBy para a lista de categorias exibidas na dropdown
   * @param index Index do item
   * @param item O item da categoria
   */
  categoriesTrackBy(index: number, item: ProductCategory): number {
    return item.code;
  }

}
