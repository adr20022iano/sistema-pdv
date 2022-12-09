import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'lpdv-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemSettingsComponent implements OnInit {

  /** Se deve exibir a opção de vendedores ou não */
  useSeller: boolean;

  /** Se deve exibir a opção de catálogo ou não */
  catalogModule: boolean;

  constructor(private authService: AuthService) {
    this.useSeller = this.authService.getUserConfig().requiredSeller > 0;
    this.catalogModule = this.authService.getUserConfig().catalogModule;
  }

  ngOnInit(): void {
  }

}
