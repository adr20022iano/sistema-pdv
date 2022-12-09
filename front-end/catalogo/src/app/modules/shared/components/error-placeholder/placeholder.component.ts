import {ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'clpdv-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderComponent implements OnInit {

  /** Texto exibido no placeHolder */
  @Input() placeholder: string;

  /** Texto exibido no botão de ação */
  @Input() action: string;

  /** Evento emitido ao clicar no botão de ação */
  @Output() actionClick = new EventEmitter<void>();

  /** O tipo do placeholder */
  @Input() type: 'empty' | 'error' = 'empty';

  /** Caminho do placeholder de erro */
  private readonly errorPlaceholder = './assets/images/placeholders/error-placeholder.svg';

  /** Caminho placeholder de empty */
  private readonly emptyPlaceholder = './assets/images/placeholders/empty-placeholder.svg';

  get imagePath(): string {
    return this.type === 'empty' ? this.emptyPlaceholder : this.errorPlaceholder;
  }

  constructor() {
  }

  ngOnInit(): void {
  }

}
