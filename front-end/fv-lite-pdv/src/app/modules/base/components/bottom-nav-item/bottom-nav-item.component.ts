import {Component, OnInit, ChangeDetectionStrategy, Input, ElementRef} from '@angular/core';

@Component({
  selector: 'lpdv-fv-bottom-nav-item',
  templateUrl: './bottom-nav-item.component.html',
  styleUrls: ['./bottom-nav-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomNavItemComponent implements OnInit {

  /** O ícone exibido no item */
  @Input() icon: string;

  /** Label exibida no item */
  @Input() label: string;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }


  /**
   * Retorna o elemento host para o ripple
   */
  getHostElement() {
    return this.elementRef.nativeElement;
  }

}
