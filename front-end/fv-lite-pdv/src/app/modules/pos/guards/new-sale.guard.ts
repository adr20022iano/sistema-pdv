import {Injectable} from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConfirmationDlgConfig} from '../../shared/components/confirmation-dlg/confirmation-dlg-config';
import {ConfirmationDlgComponent} from '../../shared/components/confirmation-dlg/confirmation-dlg.component';
import {NewSaleComponent} from '../components/new-sale/new-sale.component';

@Injectable({
  providedIn: 'root'
})
export class NewSaleGuard implements CanDeactivate<NewSaleComponent> {

  constructor(private dialog: DcDialog) {
  }

  canDeactivate(component: NewSaleComponent):
    Observable<boolean> | boolean {

    if (component.canLeaveNewSale()) {

      return true;

    } else {

      const config = new ConfirmationDlgConfig(
        'Sair da venda?',
        'Esta venda possui produtos e não foi salva, se você sair ela será perdida.',
        undefined,
        'Continuar venda',
        'Sair'
      );

      return this.dialog.open(ConfirmationDlgComponent, {data: config, autoFocus: true, minWidth: '35%'}).afterClosed().pipe(map(result => {
        return !result;
      }));

    }

  }

}
