import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {LayoutService} from 'src/app/modules/core/services/layout.service';
import {takeUntil} from 'rxjs/operators';
import {CustomersFilter} from '../../models/customer-filter';

@Component({
  selector: 'lpdv-fv-customers-filter',
  templateUrl: './customers-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersFilterComponent implements OnInit, OnDestroy {

  /** FormGroup do formulário de filtro */
  filterForm = new FormGroup({
    name: new FormControl(),
    city: new FormControl(),
    document: new FormControl()
  });

  /** Gerencia as inscrições */
  unsub: Subject<any> = new Subject();

  constructor(private sideMenuRef: DcSideMenuRef<CustomersFilterComponent>, @Inject(SIDE_MENU_DATA) public filter: CustomersFilter,
              private layoutService: LayoutService) {

    this.filterForm.patchValue(filter);

  }

  ngOnInit(): void {
    this.initLayoutChanges();
  }

  /**
   * Fecha o menu retornando a o filtro informado
   * @param resetFilter Se deve redefinir o filtro ou não
   */
  filterCustomers(resetFilter?: boolean) {

    // Fecha o menu
    this.sideMenuRef.close(resetFilter ? true : this.filterForm.getRawValue() as CustomersFilter);

  }

  ngOnDestroy() {

    /** Envia o sinal para as inscrições serem invalidadas */
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

}
