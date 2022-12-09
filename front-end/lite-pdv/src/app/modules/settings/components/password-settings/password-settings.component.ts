import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {SettingsService} from '../../services/settings.service';
import {CustomValidators} from 'src/app/modules/shared/validators/custom-validators';
import {takeUntil} from 'rxjs/operators';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';

/**
 * Pattern para criação da nova senha
 */
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-zA-Z])(?=.{8,})/;

@Component({
  selector: 'lpdv-password-settings',
  templateUrl: './password-settings.component.html',
  styleUrls: ['./password-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordSettingsComponent implements OnInit, OnDestroy {

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  /**
   * Formulário de alteração de senha
   */
  sellersPasswordForm: FormGroup;

  constructor(fb: FormBuilder, private settingsService: SettingsService, private snackBar: DcSnackBar) {

    this.sellersPasswordForm = fb.group({
      password: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]),
      passwordMatch: new FormControl('', [Validators.required])
    }, {validators: CustomValidators.matchValidator('password', 'passwordMatch')});

  }

  ngOnInit(): void {
  }

  /**
   * Realiza a alteração da senha
   */
  changeSellerPassword() {

    // Verifica sobre qual formulário deve realizar as operações
    const newPassword = this.sellersPasswordForm.get('password').value;
    this.sellersPasswordForm.disable();

    this.settingsService.updateSellersPassword(newPassword).pipe(takeUntil(this.unsub)).subscribe(() => {

      this.snackBar.open('Senha dos vendedores alterada com sucesso.', null, {duration: 3500, panelClass: 'sucesso'});
      this.sellersPasswordForm.reset();
      this.sellersPasswordForm.enable();

    }, () => {
      this.sellersPasswordForm.enable();
    });

  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

}
