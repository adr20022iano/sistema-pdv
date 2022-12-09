import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output
} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[lpdv-bottom-menu-item]',
  templateUrl: './bottom-menu-item.component.html',
  styleUrls: ['./bottom-menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomMenuItemComponent {

  /** Define o tabIndex do elemento */
  @HostBinding('tabindex') tabIndex = 0;

  /** Define o role do elemento */
  @HostBinding('attr.role') role = 'menuitem';

  /** O ícone exibido no item */
  @Input() icon: string;

  /** Label exibida no item */
  @Input() label: string;

  /** Evento emitido quando o item é clicado */
  @Output() itemClick = new EventEmitter<void>();

  /**
   * Adiciona um listener para os eventos de click no elemento
   */
  @HostListener('click')
  onClick() {
    this.itemClick.emit();
  }

  constructor(private elementRef: ElementRef) {
  }

  /**
   * Retorna o elemento host para o ripple
   */
  getHostElement() {
    return this.elementRef.nativeElement;
  }

}
