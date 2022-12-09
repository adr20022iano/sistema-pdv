import {Component, OnInit, ChangeDetectionStrategy, EventEmitter, Input, Output} from '@angular/core';
import {BookCategory} from '../../models/book-category';

@Component({
  selector: 'lpdv-cash-book-category',
  templateUrl: './cash-book-category.component.html',
  styleUrls: ['./cash-book-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashBookCategoryComponent implements OnInit {

  /** A categoria listada no componente */
  @Input() category: BookCategory;

  /** Evento emitido ao clicar no botão editar da categoria */
  @Output() edit = new EventEmitter<void>();

  /** Evento emitido ao clicar no botão excluir da categoria */
  @Output() delete = new EventEmitter<void>();

  constructor() {
  }

  /**
   * Retorna se a categoria pode ser alterada ou excluída
   */
  get canEdit() {
    return this.category.code !== 1;
  }

  ngOnInit(): void {
  }

}
