import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lpdvDiscount'
})
export class DiscountPipe implements PipeTransform {

  transform(value: number): number {

    if (value && value !== 0) {

      return -Math.abs(value);

    }

    return 0;
  }

}
