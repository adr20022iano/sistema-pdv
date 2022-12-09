export class ConfirmationDlgConfig {

  /** O título da janela de diálogo */
  title: string;

  /** A descrição da janela de diálogo */
  description: string;

  /** O texto exibido como dica */
  hintText: string;

  /** O texto exibido no botão positivo */
  positiveText: string;

  /** O texto exibido no botão negativo */
  negativeText: string;

  constructor(title?: string, description?: string, hint?: string, positiveText: string = 'Confirmar', negativeText: string = 'Cancelar') {

    this.title = title;
    this.description = description;
    this.hintText = hint;
    this.positiveText = positiveText;
    this.negativeText = negativeText;

  }

}
