import {Component, OnInit, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {LoaderStatus} from '@devap-br/devap-components/loader';
import {SettingsService} from '../../services/settings.service';
import {takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/auth.service';
import {SystemBehavior} from '../../models/system-behavior';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';

@Component({
  selector: 'lpdv-system-behavior',
  templateUrl: './system-behavior.component.html',
  styleUrls: ['./system-behavior.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemBehaviorComponent implements OnInit, OnDestroy {

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  /** Formulário de comportamento do sistema */
  behaviorForm = new FormGroup({
    saleObservation: new FormControl(),
    postSalePrintPagesNumber: new FormControl(),
    couponMarginRight: new FormControl(null, [Validators.max(100)]),
    couponMarginLeft: new FormControl(null, [Validators.max(100)]),
    requiredSeller: new FormControl(),
    requiredCustomerOnSale: new FormControl(),
    calculateStock: new FormControl(),
    useProduction: new FormControl(),
    selectedAverageCost: new FormControl(),
    receiptType: new FormControl()
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
   * Atualiza as configurações de comportamento do sistema
   */
  updateSystemBehavior() {

    if (this.behaviorForm.invalid) {
      return;
    }

    this.behaviorForm.disable();
    const systemBehavior = this.behaviorForm.getRawValue() as SystemBehavior;

    this.settingsService.updateSystemBehavior(systemBehavior).pipe(takeUntil(this.unsub)).subscribe(() => {

      // Habilita o formulário e força a atualização do token do usuário para atualizar as configurações
      this.behaviorForm.enable();
      this.authService.renewToken();
      this.snackBar.open('Configurações atualizadas com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});

    }, () => {

      this.behaviorForm.enable();

    });

  }

  /**
   * Realiza a consulta das configurações
   */
  private loadSettings() {

    this.settingsService.loadSystemBehavior().pipe(takeUntil(this.unsub)).subscribe(response => {

      this.behaviorForm.patchValue(response);
      this.status.next('pronto');

    });

  }
}
