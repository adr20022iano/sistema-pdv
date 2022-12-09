import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {ProductsService} from '../../services/products.service';
import {LayoutService} from '../../../core/services/layout.service';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {BehaviorSubject, Subject} from 'rxjs';
import {PrixUnoHelper} from '../../../shared/helpers/prix-uno-helper';

@Component({
  selector: 'lpdv-scale-export',
  templateUrl: './scale-export.component.html',
  styleUrls: ['./scale-export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScaleExportComponent implements OnInit, OnDestroy {

  /** Se está exportando o arquivo ou não */
  exporting = new BehaviorSubject(false);

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private productsService: ProductsService, private layoutService: LayoutService,
              private sideMenuRef: DcSideMenuRef<ScaleExportComponent>) {
  }

  ngOnInit(): void {
    this.initLayoutChanges();
  }

  exportProducts(): void {

    this.exporting .next(true);
    this.productsService.scaleIntegration().pipe(takeUntil(this.unsub)).subscribe(response => {

      PrixUnoHelper.createMGVFile(response);
      this.sideMenuRef.close();

    }, () => {
      this.exporting.next(false);
    });

  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

}


