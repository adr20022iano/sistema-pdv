import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {SettingsService} from '../../services/settings.service';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {FormControl, FormGroup} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {SystemResources} from '../../models/system-resources';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'lpdv-system-resources',
  templateUrl: './system-resources.component.html',
  styleUrls: ['./system-resources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemResourcesComponent implements OnInit, OnDestroy {

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Formulário de comportamento do sistema */
  resourcesForm = new FormGroup({
    scaleIntegration: new FormControl(),
    useProductImage: new FormControl()
  });

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private settingsService: SettingsService, private snackBar: DcSnackBar, private authService: AuthService) {
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
   * Atualiza as configurações de comportamento do sistema
   */
  updateSystemResources() {

    if (this.resourcesForm.invalid) {
      return;
    }

    this.resourcesForm.disable();
    const systemResources = this.resourcesForm.getRawValue() as SystemResources;

    this.settingsService.updateSystemResources(systemResources).pipe(takeUntil(this.unsub)).subscribe(() => {

      // Habilita o formulário e força a atualização do token do usuário para atualizar as configurações
      this.resourcesForm.enable();
      this.authService.renewToken();
      this.snackBar.open('Configurações atualizadas com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.resourcesForm.enable();

    });

  }

  /**
   * Realiza a consulta das configurações
   */
  private loadSettings() {

    this.settingsService.loadSystemResources().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.resourcesForm.patchValue(response);
      this.status.next('pronto');

    });

  }

}
