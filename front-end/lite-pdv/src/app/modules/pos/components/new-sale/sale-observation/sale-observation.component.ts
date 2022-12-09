import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DcSideMenuRef} from '@devap-br/devap-components/side-menu';
import {FormControl, FormGroup} from '@angular/forms';
import {LayoutService} from '../../../../core/services/layout.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Platform} from '@angular/cdk/platform';
import {DcInput} from '@devap-br/devap-components/input';
import {NewSaleService} from '../../../services/new-sale.service';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';

@Component({
  selector: 'lpdv-sale-observation',
  templateUrl: './sale-observation.component.html',
  styleUrls: ['./sale-observation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleObservationComponent implements OnInit, OnDestroy {

  /** Formulário de observação */
  observationForm: FormGroup;

  /** Referência do input de observação */
  @ViewChild('observationInput') observationInput: ElementRef<DcInput>;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private sideMenuRef: DcSideMenuRef<SaleObservationComponent>,
              private layoutService: LayoutService, private platform: Platform, private newSaleService: NewSaleService,
              private snackBar: DcSnackBar) {

    this.observationForm = new FormGroup({
      observation: new FormControl(this.newSaleService.getObservation())
    });

  }

  ngOnInit(): void {
    this.initLayoutChanges();
  }

  ngOnDestroy(): void {

    // Envia o sinal para as inscrições serem invalidadas
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Salva a observação da venda
   */
  saveObservation(): void {
    const observation = this.observationForm.get('observation').value;
    this.newSaleService.setSaleObservation(observation);
    this.snackBar.open('Observação atualizada', null, {duration: 2500, panelClass: 'sucesso'});
    this.sideMenuRef.close();
  }

  /**
   * Inscreve para os eventos de mudança na visualização emitidos pelo LayoutService
   */
  private initLayoutChanges() {

    this.layoutService.onMobileBPChanges().pipe(takeUntil(this.unsub)).subscribe(isMobile => {
      this.sideMenuRef.updateSize(isMobile ? '100%' : '520px', '100%');
    });

  }

  /**
   * Remove a observação da venda.
   */
  clearObs() {

    this.newSaleService.setSaleObservation(undefined);
    this.sideMenuRef.close();

  }

}
