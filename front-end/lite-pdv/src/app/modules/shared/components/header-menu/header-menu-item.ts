export interface HeaderMenuItem {

  /** O texto exibido no botão */
  label: string;

  /** O ícone exibido no botão */
  icon?: string;

  /** Função executada ao clicar no botão, ignorada se uma rota de navegação for informada */
  onClick?: () => void;

  /** Rota para navegação, se definido, a função onClick é ignorada */
  url?: string;

  /** Label exibida como atalho do teclado */
  shortcut?: string;

}
