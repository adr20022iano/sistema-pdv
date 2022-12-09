import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CompositionProduct } from '../../models/composition-product';

@Component({
  selector: 'lpdv-production-item',
  templateUrl: './production-item.component.html',
  styleUrls: ['./production-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionItemComponent implements OnInit {

  /** Item de composição da produção exibido no componente */
  @Input() compositionProduct: CompositionProduct;

  /** Evento emitido ao clicar no botão excluir do item */
  @Output() delete = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

}
