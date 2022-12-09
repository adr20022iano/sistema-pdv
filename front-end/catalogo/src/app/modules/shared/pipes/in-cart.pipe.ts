import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'inCart'
})
export class InCartPipe implements PipeTransform {

  transform(value: number): string {

    if (!value) {
      return '0';
    }

    return value > 99 ? '+99' : value.toString();

  }

}
