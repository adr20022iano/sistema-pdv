import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from '../../services/settings.service';
import {AuthService} from '../../../core/services/auth.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {takeUntil} from 'rxjs/operators';
import {CatalogSettings} from '../../models/catalog-settings';

@Component({
  selector: 'lpdv-catalog-settings',
  templateUrl: './catalog-settings.component.html',
  styleUrls: ['./catalog-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogSettingsComponent implements OnInit, OnDestroy {

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Formulário de comportamento do sistema */
  catalogSettingsForm = new FormGroup({
    showPriceOnCatalogAfterLogin: new FormControl()
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
  updateCatalogSettings() {

    if (this.catalogSettingsForm.invalid) {
      return;
    }

    this.catalogSettingsForm.disable();
    const catalogSettings = this.catalogSettingsForm.getRawValue() as CatalogSettings;

    this.settingsService.updateCatalogSettings(catalogSettings).pipe(takeUntil(this.unsub)).subscribe(() => {

      // Habilita o formulário e força a atualização do token do usuário para atualizar as configurações
      this.catalogSettingsForm.enable();
      this.authService.renewToken();
      this.snackBar.open('Configurações atualizadas com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.catalogSettingsForm.enable();

    });

  }

  /**
   * Realiza a consulta das configurações
   */
  private loadSettings() {

    this.settingsService.loadCatalogSettings().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.catalogSettingsForm.patchValue(response);
      this.status.next('pronto');

    });

  }

}
