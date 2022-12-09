import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {FeaturedCategory} from '../../models/featured-category';
import {Product} from '../../models/product';

@Component({
  selector: 'clpdv-featured-category',
  templateUrl: './featured-category.component.html',
  styleUrls: ['./featured-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedCategoryComponent implements OnInit {

  /**
   * Categoria exibida no componente
   */
  @Input() category: FeaturedCategory;

  /**
   * Evento emitido quando um produto é clicado
   */
  @Output() productDetails = new EventEmitter<{product: Product, productIndex: number }>();

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Função trackBy para a lista de produtos das categorias em destaque.
   */
  productsTrackBy(index: number, item: Product): number {
    return item.code;
  }

}
