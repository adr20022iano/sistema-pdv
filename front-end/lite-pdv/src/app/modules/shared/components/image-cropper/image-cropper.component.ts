import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import Cropper from 'cropperjs';
import {DcDialogRef} from '@devap-br/devap-components';
import {Subject} from 'rxjs';
import {DC_DIALOG_DATA} from '@devap-br/devap-components/dialog';
import {SafeUrl} from '@angular/platform-browser';

export interface ImageCropperParams {
  fileURL: SafeUrl;

  /** Se a sombra de corte da imagem será um círculo ou não. */
  roundCropper: boolean;

  /** A cor de background da imagem cortada em HEX, se não informado, transparente. */
  fillColor?: string;

  /** O aspect ratio da área de corte da imagem, se não informado livre. */
  aspectRatio?: number;

  /** A largura do output do corte, por padrão Infinity */
  outputWidth?: number;

  /** A altura do output do corte, por padrão Infinity */
  outputHeight?: number;

  /** O formato do arquivo que foi selecionado para corte */
  fileType?: string;

}

@Component({
  selector: 'lpdv-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageCropperComponent implements OnInit, AfterViewInit, OnDestroy {

  /** Elemento img a área de corte da imagem é exibida. */
  @ViewChild('image') image: ElementRef<HTMLImageElement>;

  /** Emite um evento quando o componente é destruído para cancelar quaisquer inscrições de observables */
  private readonly unsub = new Subject<void>();

  /** Instância do Cropper */
  private cropper: Cropper;

  constructor(private dialogRef: DcDialogRef<ImageCropperComponent>, @Inject(DC_DIALOG_DATA) public cropperParams: ImageCropperParams) {

    if (!cropperParams) {
      throw new Error('Defina os parâmetros do componente de corte da imagem');
    }

  }

  /**
   * Aplica ou não a classe para deixar a sombra de corte redonda.
   * Classe definida no arquivo styles.scss.
   */
  @HostBinding('class.round-cropper') get roundCropper() {
    return this.cropperParams.roundCropper;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    // Como a cropper é uma biblioteca em .js, a inicializamos após a view do componente
    this.cropper = new Cropper(this.image.nativeElement, {
      aspectRatio: this.cropperParams.aspectRatio || NaN,
      minCropBoxWidth: this.cropperParams.outputWidth || 0,
      minCropBoxHeight: this.cropperParams.outputHeight || 0,
      autoCropArea: 0.85,
      guides: false,
      responsive: false
    });

  }

  /**
   * Fecha a janela de diálogo retornando a imagem no result.
   */
  cropImage(): void {

    const result = this.cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      minWidth: 1024,
      minHeight: 1024,
      maxWidth: 1024,
      maxHeight: 1024,
      fillColor: this.cropperParams.fillColor || 'transparent'
    }).toDataURL(this.cropperParams.fileType, 0.95);
    this.dialogRef.close(result);

  }

  /**
   * Aplica o zoom na imagem
   * @param zoomIn Se o zoom irá aumentar ou reduzir.
   */
  zoom(zoomIn: boolean): void {
    this.cropper.zoom(zoomIn ? 0.1 : -0.1);
  }

  /**
   * Move a imagem no canvas.
   * @param offsetX o movimento no eixo X;
   * @param offsetY o movimento no eixo Y;
   */
  move(offsetX: number, offsetY: number): void {
    this.cropper.move(offsetX, offsetY);
  }

  /**
   * Redefine o cropper.
   */
  reset(): void {
    this.cropper.reset();
  }

  ngOnDestroy(): void {

    // Emite o evento para finalizar as inscrições
    this.unsub.next();
    this.unsub.complete();

  }

}
