import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Seller} from '../../models/seller';

@Component({
  selector: 'lpdv-seller-item',
  templateUrl: './seller-item.component.html',
  styleUrls: ['./seller-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellerItemComponent implements OnInit {

  /** O vendedor listado no item */
  @Input() seller: Seller;

  /** Evento emitido ao clicar no botão excluir do contato */
  @Output() delete = new EventEmitter<void>();

  /** Evento emitido ao clicar no botão editar */
  @Output() edit = new EventEmitter<void>();

  /** Evento emitido ao clicar no botão copiar */
  @Output() copyAccessCode = new EventEmitter<void>();

  constructor() {
  }

  ngOnInit(): void {
  }

}
