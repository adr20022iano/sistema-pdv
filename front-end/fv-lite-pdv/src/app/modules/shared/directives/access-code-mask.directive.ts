import {Directive, ElementRef, forwardRef, HostListener} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {InputHelper} from '@devap-br/devap-components/common';

export const ACCESS_CODE_MASK_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AccessCodeMaskDirective),
  multi: true
};

@Directive({
  selector: '[lpdvFvAccessCodeMask]',
  providers: [ACCESS_CODE_MASK_VALUE_ACCESSOR]
})
export class AccessCodeMaskDirective implements ControlValueAccessor {

  /** Variável que armazena a função onChange do ControlValueAccessor como um método interno */
  private onValueChange: (_: any) => void;

  /** Variável que armazena a função onTouched do ControlValueAccessor como um método interno */
  private onTouched: () => void;

  /** O valor do input */
  private controlValue: string;

  constructor(public elementRef: ElementRef) {

    // Recupera a referência do elemento input
    this.elementRef.nativeElement.maxLength = 19;

  }

  /**
   * Retorna o valor do FormControl
   */
  get value(): string {
    return this.controlValue;
  }

  /**
   * Define o valor FormControl
   */
  set value(newValue: string) {
    this.controlValue = newValue;
  }

  /**
   * Registra uma função de callback que é chamada quando o valor do controlador é atualizado na UI;
   * Este método é chamado pela Forms API na inicialização para atualizar o form model quando valores são propagados da UI para o model.
   * Quando o valor muda na UI, chamamos esta a função registrada para permitir que a Forms API se atualize.
   */
  registerOnChange(fn: any): void {
    this.onValueChange = fn;
  }

  /**
   * Registra uma função de callback que é chamada pela Forms API durante a inicialização para atualizar o form model durante eventos blur.
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Escreve um novo valor no elemento.
   * Este método é chamado pela Forms API para escrever na view quando alterações do model são realizadas programaticamente, por exemplo
   * usando a função `setValue` de um `formControl`.
   */
  writeValue(value: any): void {
    this.value = value ? InputHelper.formatCep(value) : '';
    this.elementRef.nativeElement.value = this.value;
  }

  /**
   * HostListener para os eventos de input (acontecem após o keyDown)
   * @param event Evento emitido
   */
  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {

    // Valor do input
    const inputValue = this.elementRef.nativeElement.value;
    this.value = AccessCodeMaskDirective.formatAccessCode(inputValue);
    this.elementRef.nativeElement.value = this.value;
    this.onValueChange(this.value);

  }

  /**
   * Formata o código de acesso informado
   * @param accessCode O valor informado no input
   * @private
   */
  private static formatAccessCode(accessCode: string): string {

    if (!accessCode) {
      return '';
    }

    // Removemos os traços já informados no valor do input
    const cleanAccessCode = accessCode.replace(/[^a-zA-Z0-9]/g, '')

    // Regex para formatação do código de acesso
    const replaceRegex = /^([a-zA-Z0-9]{1,4})([a-zA-Z0-9]{0,4})([a-zA-Z0-9]{0,4})([a-zA-Z0-9]{0,4})/g;

    // Usamos a regex para separar o valor informado em grupos, verificamos se o grupo foi informado e o concatenamos no resultado
    return cleanAccessCode.replace(replaceRegex, (a: string, b: string, c: string, d: string, e: string): string => {

      const values = [b, c, d, e];
      let result = '';
      values.filter(group => group !== '').forEach(group => {

        if (result) {
          result = result.concat('-', group);
        } else {
          result = group;
        }

      })

      return result.toUpperCase();

    });

  }

}
