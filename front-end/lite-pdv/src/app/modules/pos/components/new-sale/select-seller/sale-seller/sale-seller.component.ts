import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit} from '@angular/core';
import {Seller} from '../../../../../sellers/models/seller';
import {FocusableOption} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'lpdv-sale-seller',
  templateUrl: './sale-seller.component.html',
  styleUrls: ['./sale-seller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleSellerComponent implements OnInit, FocusableOption {

  /** O vendedor exibido no componente */
  @Input() seller: Seller;

  /** Define o tabIndex do elemento */
  @HostBinding('tabindex') tabIndex = 0;

  /** Se o item está selecionado */
  private isSelected: boolean;

  constructor(private elementRef: ElementRef) {
  }

  /** Input para definir se o item está selecionado ou não */
  @Input()
  set selected(selected: boolean) {
    this.isSelected = coerceBooleanProperty(selected);
  }

  /**
   * Adiciona a classe para destacar o item que foi selecionado
   */
  @HostBinding('class.selected')
  get hostSelectedClass() {
    return this.isSelected;
  }

  ngOnInit(): void {
  }

  focus(): void {
    this.elementRef.nativeElement.focus();
  }

}
