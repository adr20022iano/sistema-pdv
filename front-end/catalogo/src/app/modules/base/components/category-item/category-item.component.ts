import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'clpdv-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryItemComponent implements OnInit {

  // noinspection SpellCheckingInspection
  @HostBinding('attr.role') role = 'listitem';

  /** Se a tooltip do item está habilitada ou não */
  showToolTip = false;

  /** O nome da categoria exibido no componente */
  @Input() categoryName: string;

  /**
   * O código da categoria
   */
  @Input() categoryCode: string;

  /** Evento emitido ao clicar no host */
  @Output() categoryClick = new EventEmitter<void>();

  /** Se o item da categoria está no drawer ou não */
  @Input() drawerLink: boolean;

  /** O conteúdo da div que exibe o nome da categoria, usado para verificar se ocorre ellipsis no componente ou não */
  @ViewChild('categoryContent') categoryContent: ElementRef<HTMLDivElement>;

  constructor() {

  }

  ngOnInit(): void {

  }

  /**
   * HostListener que verifica se deve exibir ou não a tooltip do conteúdo
   * do item quando o mouse estiver sobre o componente.
   */
  @HostListener('mouseover') onHover(): void {

    const scrollWidth = this.categoryContent.nativeElement.scrollWidth;
    const clientWidth = this.categoryContent.nativeElement.clientWidth;
    this.showToolTip = scrollWidth > clientWidth;

  }

  /**
   * HostListener que emite o evento de clique quando um item é clicado.
   */
  @HostListener('click') onClick(): void {
    this.categoryClick.emit();
  }

}
