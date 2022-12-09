import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {FileHelper} from '../../helpers/file-helper';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ImageCropperComponent, ImageCropperParams} from '../image-cropper/image-cropper.component';
import {takeUntil} from 'rxjs/operators';
import {DcDialog} from '@devap-br/devap-components/dialog';
import {DcSnackBar} from '@devap-br/devap-components/snack-bar';
import {Subject} from 'rxjs';
import {coerceBooleanProperty, coerceCssPixelValue, coerceNumberProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'lpdv-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploaderComponent implements OnInit, OnDestroy {

  /** String para o caminho do placeholder exibido no imageUploader */
  @Input() placeholderSrc: string;

  /** String para o caminho da imagem que será exibida no uploader, com preferência sobre o placeholder */
  @Input() imageSrc: string;

  /** O altText para ser utilizado na tag image */
  @Input() imageAlt: string;

  /** A cor que será usada no background da imagem */
  @Input() fillColor: string;

  /** Evento emitido quando a opção de remover imagem é clicada */
  @Output() removeImage = new EventEmitter<void>();

  /**
   * Evento emitido quando uma imagem é selecionada.
   * Retorna a string em base64 da imagem.
   */
  @Output() imageSelected = new EventEmitter<string>();

  /** Referência do elemento de imagem que exibe a imagem selecionada para upload. */
  @ViewChild('image') image: ElementRef<HTMLImageElement>;

  /** Referência do input de seleção de imagens */
  @ViewChild('uploadInput') uploadInput: ElementRef<HTMLInputElement>;

  /** Emite um evento quando o componente é destruído para cancelar quaisquer inscrições de observables */
  private readonly unsub = new Subject<void>();

  private isDisabled: boolean;
  private isRounded: boolean;
  private cropperOutputWidth: number;
  private cropperOutputHeight: number;
  private cropperAspectRatio: number;
  private imageBorderRadius: string;

  constructor(private dialog: DcDialog, private snackBar: DcSnackBar, private sanitizer: DomSanitizer) {
  }

  /**
   * Retorna o src para a imagem que deve ser exibida no uploader ou o placeholder.
   */
  get displaySrc() {
    return this.imageSrc ? this.imageSrc : this.placeholderSrc;
  }

  get disabled() {
    return this.isDisabled;
  }

  /** Se os botões do componente estão habilitados ou não. */
  @Input()
  set disabled(value: boolean) {
    this.isDisabled = coerceBooleanProperty(value);
  }

  get rounded() {
    return this.isRounded;
  }

  /** Se o uploader é de uma imagem redonda */
  @Input()
  set rounded(value: boolean) {
    this.isRounded = coerceBooleanProperty(value);
  }

  /** Retorna a largura do output do cropper */
  get outputWidth() {
    return this.cropperOutputWidth;
  }

  /** Define a largura do output do cropper */
  @Input()
  set outputWidth(value: number) {
    this.cropperOutputWidth = coerceNumberProperty(value);
  }

  /** Retorna a altura do output do cropper */
  get outputHeight() {
    return this.cropperOutputHeight;
  }

  /** Define a altura do output do cropper */
  @Input()
  set outputHeight(value: number) {
    this.cropperOutputHeight = coerceNumberProperty(value);
  }

  /** Retorna o aspect ratio da área de corte do cropper */
  get aspectRatio() {
    return this.cropperAspectRatio;
  }

  /** Define o aspect ratio da área de corte do cropper */
  @Input()
  set aspectRatio(value: number) {
    this.cropperAspectRatio = coerceNumberProperty(value);
  }

  /** O border radius da imagem, tem precedência sobre rounded */
  @Input()
  set borderRadius(value: string) {
    this.imageBorderRadius = coerceCssPixelValue(value);
  }

  /** Retorna o border radius da imagem */
  get borderRadius() {
    return this.imageBorderRadius;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

    // Emite o evento para finalizar as inscrições
    this.unsub.next();
    this.unsub.complete();

  }

  /**
   * Emite um clique no input oculto de seleção de foto.
   */
  openFileSelection(): void {
    this.uploadInput.nativeElement.value = '';
    this.uploadInput.nativeElement.click();
  }

  /**
   * Marca para excluir a foto do clube ao salvar as alterações e retorna a exibição para o placeholder.
   */
  removePicture(): void {
    this.imageSrc = undefined;
    this.removeImage.emit();
  }

  /**
   * Invocado quando o input de seleção de foto emite o evento change.
   */
  pictureSelected(fileChange): void {

    const fileHelper = new FileHelper();
    fileHelper.validateSelectedFile(fileChange).then((file => {

      const fileURL = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.cropPicture(fileURL, file.type);

    }), (error) => {

      this.uploadInput.nativeElement.value = '';
      this.snackBar.open(error, null, {panelClass: 'falha', duration: 2500});

    });

  }

  /**
   * Redefine o status do uploader para o seu valor inicial.
   */
  reset(): void {
    this.uploadInput.nativeElement.value = '';
    this.imageSrc = undefined;
    this.image.nativeElement.src = this.placeholderSrc;
  }

  /**
   * Abre a janela de diálogo para cortar a imagem do atleta.
   */
  private cropPicture(fileURL: SafeUrl, fileType: string): void {

    const cropperParams: ImageCropperParams = {
      fileURL, roundCropper: this.rounded, outputHeight: this.outputHeight, outputWidth: this.outputWidth,
      aspectRatio: this.rounded ? 1 : this.aspectRatio, fillColor: this.fillColor, fileType
    };
    this.dialog.open(ImageCropperComponent, {
      data: cropperParams,
      autoFocus: false
    }).afterClosed().pipe(takeUntil(this.unsub))
      .subscribe((result: string | undefined) => {

        if (result && result.length > 1) {

          this.image.nativeElement.src = result;
          this.imageSelected.emit(result);

        }

      });

  }

}
