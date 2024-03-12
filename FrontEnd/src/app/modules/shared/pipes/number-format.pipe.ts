import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {
  constructor(private _decimalPipe: DecimalPipe) { }

  transform(number) {
    try {
      return number ? this._decimalPipe.transform(number, '1.0-2') : 0;
    } catch (err) {
      return number;
    }
  }
}
