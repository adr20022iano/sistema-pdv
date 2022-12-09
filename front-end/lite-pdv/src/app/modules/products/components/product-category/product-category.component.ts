import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { ProductCategory } from '../../models/product-category';

@Component({
  selector: 'lpdv-product-category',
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsCategoryComponent implements OnInit {

  /** A categoria listada no componente */
  @Input() productCategory: ProductCategory;

  /** Evento emitido ao clicar no botão editar da categoria */
  @Output() edit = new EventEmitter<void>();

  /** Evento emitido ao clicar no botão excluir da categoria */
  @Output() delete = new EventEmitter<void>();

  /** Se a integração do catálogo está ativa ou não */
  @Input() catalogModule: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
