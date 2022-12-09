export class ConfirmationDlgConfig {

  /** O título da janela de diálogo */
  title: string;

  /** A descrição da janela de diálogo */
  description: string;

  /** O texto exibido como dica */
  hintText: string;

  /** Segunda linha do texto de dica */
  secondaryHint: string;

  /** O texto exibido no botão positivo */
  positiveText: string;

  /** O texto exibido no botão negativo */
  negativeText: string;

  /** Se deve exibir o botão negativo ou não */
  showNegative: boolean;

  /** Se deve exibir o título em vermelho ou não */
  errorTitle: boolean;

  constructor(title?: string, description?: string, hint?: string, positiveText: string = 'Confirmar', negativeText: string = 'Cancelar',
              showNegative: boolean = true, errorTitle: boolean = false, secondaryHint = '') {

    this.title = title;
    this.description = description;
    this.hintText = hint;
    this.positiveText = positiveText;
    this.negativeText = negativeText;
    this.showNegative = showNegative;
    this.errorTitle = errorTitle;
    this.secondaryHint = secondaryHint;

  }

}
