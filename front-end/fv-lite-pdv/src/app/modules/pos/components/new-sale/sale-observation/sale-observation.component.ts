import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DcSideMenuRef, SIDE_MENU_DATA} from '@devap-br/devap-components/side-menu';
import {FormControl, FormGroup} from '@angular/forms';
import {LayoutService} from '../../../../core/services/layout.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Platform} from '@angular/cdk/platform';
import {DcInput} from '@devap-br/devap-components/input';

@Component({
  selector: 'lpdv-sale-observation',
  templateUrl: './sale-observation.component.html',
  styleUrls: ['./sale-observation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleObservationComponent implements OnInit, OnDestroy {

  /** Formulário de observação */
  observationForm: FormGroup;

  /** Se é um dispositivo mobile */
  mobileDevice: boolean;

  /** Referência do input de observação */
  @ViewChild('observationInput') observationInput: ElementRef<DcInput>;

  /** Emite durante o encerramento do componente para cancelar as inscrições atuais */
  private readonly unsub = new Subject<void>();

  constructor(private sideMenuRef: DcSideMenuRef<SaleObservationComponent>, @Inject(SIDE_MENU_DATA) private saleObservation,
              private layoutService: LayoutService, private platform: Platform) {

    this.observationForm = new FormGroup({
      observation: new FormControl(saleObservation)
    });

    this.mobileDevice = this.platform.IOS || this.platform.ANDROID;

  }

  ngOnInit(): void {
    this.initLayoutChanges();

    this.sideMenuRef.afterOpened().pipe(takeUntil(this.unsub)).subscribe(() => {
      if (!this.mobileDevice) {
        this.observationInput.nativeElement.focus();
      }
    });

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
    this.sideMenuRef.close(observation);
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
