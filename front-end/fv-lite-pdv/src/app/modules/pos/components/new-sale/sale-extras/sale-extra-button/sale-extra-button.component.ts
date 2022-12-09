import {Component, OnInit, ChangeDetectionStrategy, HostBinding, ElementRef, Input} from '@angular/core';

@Component({
  selector: 'lpdv-sale-extra-button',
  templateUrl: './sale-extra-button.component.html',
  styleUrls: ['./sale-extra-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleExtraButtonComponent implements OnInit {

  /** Se o botão está ativo ou não */
  @Input() active: boolean;

  /** Define o tabIndex do elemento */
  @HostBinding('tabindex') tabIndex = 0;

  /** Define o role do elemento */
  @HostBinding('attr.role') role = 'menuitem';

  constructor(private elementRef: ElementRef) {
  }

  /** Define o role do elemento */
  @HostBinding('class.active') get hostActiveClass() {
    return this.active;
  }

  ngOnInit(): void {
  }

  /**
   * Retorna o elemento host para o ripple
   */
  getHostElement() {
    return this.elementRef.nativeElement;
  }

}
