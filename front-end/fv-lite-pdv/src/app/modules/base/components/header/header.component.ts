import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {DcOverlayComponent} from '@devap-br/devap-components/overlay/public-api';
import {Subject} from 'rxjs';
import {AuthService} from 'src/app/modules/core/services/auth.service';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {ConfirmationDlgConfig} from '../../../shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from '../../../shared/components/confirmation-dlg/confirmation-dlg.component';
import {takeUntil} from 'rxjs/operators';


@Component({
  selector: 'lpdv-fv-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {

  /**
   * Título da página, exibido na visualização desktop
   */
  @Input() pageTitle: string;

  /** Evento emitido quando o botão toggle do drawer é clicado */
  @Output() toggleDrawer = new EventEmitter<void>();

  /** View do overlay */
  @ViewChild('userMenu') userMenu: DcOverlayComponent;

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  constructor(private authService: AuthService, private dialog: DcDialog) {
  }

  ngOnInit() {
  }

  /**
   * Realiza o logout do usuário e o redireciona para a página de login
   */
  logout() {

    // Como a venda não foi paga totalmente, verificamos com o usuário se ele deseja finalizar a venda
    const config = new ConfirmationDlgConfig(
      'Sair do sistema',
      'Tem certeza que deseja sair?',
      null,
      'Sair',
      'Cancelar');

    this.dialog.open(ConfirmationDlgComponent, {
      data: config,
      minWidth: '35%'
    }).afterClosed().pipe(takeUntil(this.unsub)).subscribe((result: boolean) => {

      if (result) {
        this.authService.logout();
      }

    });


  }

  /**
   * Abre a página de suporte
   */
  openSupport(): void {
    window.open('https://devap.com.br/contato#suporte', '_blank');
  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

}
