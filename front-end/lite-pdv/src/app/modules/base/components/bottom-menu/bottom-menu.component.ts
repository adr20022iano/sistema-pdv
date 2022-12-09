import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import {BottomMenuItemComponent} from '../bottom-menu-item/bottom-menu-item.component';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'lpdv-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  /** Se a plataforma atual é IOS */
  @Input() isIOS: boolean;

  /** Define a classe se for IOS */
  @HostBinding('class.ios-platform')
  get IOS() {
    return this.isIOS;
  }

  /** Define o role do elemento */
  @HostBinding('attr.role') role = 'menubar';

  /** QueryList dos itens do menu */
  @ViewChildren(BottomMenuItemComponent) drawerItens: QueryList<BottomMenuItemComponent>;

  /** Evento emitido ao clicar em um item do menu */
  @Output() itemClick = new EventEmitter<void>();

  /** Se deve exibir ou não o ícone de relatórios */
  showReportsIcon: BehaviorSubject<boolean>;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {

    this.showReportsIcon = new BehaviorSubject<boolean>(this.authService.isAdmin() || this.authService.getUserConfig()?.sellerSalesReport);
    this.authService.onConfigChange().pipe(takeUntil(this.unsub)).subscribe(userConfig => {
      this.showReportsIcon.next(userConfig?.admin || userConfig?.sellerSalesReport);
    });

  }

  ngAfterViewInit(): void {

    // Emite os eventos de itens dos clicks dos itens do menu
    merge(...this.drawerItens.map(option => option.itemClick)).pipe(takeUntil(this.unsub)).subscribe(() => {
      this.itemClick.emit();
    });

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

}
