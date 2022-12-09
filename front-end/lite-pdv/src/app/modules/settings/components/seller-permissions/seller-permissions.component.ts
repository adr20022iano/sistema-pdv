import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {FormControl, FormGroup} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {SettingsService} from '../../services/settings.service';
import {SellerPermissions} from '../../models/seller-permissions';
import {AuthService} from '../../../core/services/auth.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';

@Component({
  selector: 'lpdv-seller-permissions',
  templateUrl: './seller-permissions.component.html',
  styleUrls: ['./seller-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellerPermissionsComponent implements OnInit, OnDestroy {

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Formulário de comportamento do sistema */
  permissionsForm = new FormGroup({
    sellerDeletePayment: new FormControl(),
    sellerDeleteSale: new FormControl(),
    sellerSalesReport: new FormControl(),
    sellerDiscount: new FormControl()
  });

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private settingsService: SettingsService, private authService: AuthService, private snackBar: DcSnackBar) {
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Atualiza as permissões do vendedor
   */
  updateSellerPermissions() {

    if (this.permissionsForm.invalid) {
      return;
    }

    this.permissionsForm.disable();
    const sellerPermissions = this.permissionsForm.getRawValue() as SellerPermissions;

    this.settingsService.updateSellerPermissions(sellerPermissions).pipe(takeUntil(this.unsub)).subscribe(() => {

      // Habilita o formulário e força a atualização do token do usuário para atualizar as configurações
      this.permissionsForm.enable();
      this.authService.renewToken();
      this.snackBar.open('Configurações atualizadas com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.permissionsForm.enable();

    });

  }

  /**
   * Realiza a consulta das configurações
   */
  private loadSettings() {

    this.settingsService.loadSellerPermissions().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.permissionsForm.patchValue(response);
      this.status.next('pronto');

    });

  }
}
