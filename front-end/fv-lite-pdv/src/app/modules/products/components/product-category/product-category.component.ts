import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { ProductCategory } from '../../models/product-category';

@Component({
  selector: 'lpdv-fv-product-category',
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsCategoryComponent implements OnInit {

  /** A categoria listada no componente */
  @Input() productCategory: ProductCategory;

  /** Evento emitido ao clicar no botão filtrar */
  @Output() filterCategory = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

}
