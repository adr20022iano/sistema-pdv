import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

export class CustomValidators {

  /**
   * Validador que obriga o controlador a ter um valor diferente de 0.
   *
   * @returns Um mapa de erro com a propriedade `zero`
   * se a validação falha, `null` ao contrário.
   */
  static zero(control: AbstractControl): ValidationErrors | null {
    const isZero = control.value === 0 || control.value === '0';
    return isZero ? {zero: true} : null;
  }

  /**
   * Realiza a validação do valor de dois controladores de define um erro `match` no
   * `matchControl` se os dois forem diferentes
   * @param baseValidatorControl Controlador que será usado como base para a validação
   * @param matchControl Controlador que receberá será validado contra o controlador base
   */
  static matchValidator(baseValidatorControl: string, matchControl: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[baseValidatorControl];
      const matchingControl = formGroup.controls[matchControl];

      if (matchingControl.errors && !matchingControl.errors.match) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({match: true});
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  /**
   * Valida um FormControl verificando se seu valor é um objeto contendo o parâmetro `key` com um valor não falso.
   * @param key A chave do objeto que será verificada.
   * @param required Se o formControl é obrigatório ou não.
   */
  static objectKeyValidator(key: string, required?: boolean): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      const value = control.value;
      if (required && this.isEmptyInputValue(value)) {
        return {invalid: true};
      }

      if (value && !value?.[key]) {
        return {invalid: true};
      }

      return null;

    };

  }

  /**
   * Retorna se o valor informado é vazio.
   * Baseado na validação de FormControl do validador `required` do Angular.
   * @param value O valor usado para comparação.
   * @private
   */
  private static isEmptyInputValue(value: any): boolean {
    return value == null || value.length === 0;
  }

}
