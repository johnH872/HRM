import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateArrFormat'
})
export class DateArrFormatPipe implements PipeTransform {

  transform(value: Date[], emtpyError: string): string {
    let result = emtpyError;
    if(value && value?.length >0) {
      var res = value.map(x =>{
        const hours = String(new Date(x).getHours()).padStart(2, '0');
        const minutes = String(new Date(x).getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`
      });
      result = res.join(", ")
    } 
    return result;
  }

}
