import { Pipe, PipeTransform } from '@angular/core';
import { NbDateService } from '@nebular/theme';
import { environment } from 'src/enviroments/enviroment';

@Pipe({
  name: 'dateTimeFormat'
})
export class DateTimeFormatPipe implements PipeTransform {

  /**
   *
   */
  constructor(protected dateService: NbDateService<Date>,) {

  }
  transform(value: any, args?: any): any {
    if (value != null && value.length > 0) {
      let dateParsed = value;
      try {
        dateParsed = this.dateService.format(new Date(value), environment.formatDateTime);
      } catch (error) {
        console.warn(error);
        dateParsed = this.dateService.format(new Date(), environment.formatDateTime);
      }
      return dateParsed;
    }
  }

}


@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  /**
   *
   */
  constructor(protected dateService: NbDateService<Date>,) {

  }
  transform(value: any, args?: any): any {
    if (value != null && value.length > 0) {
      let dateParsed = value;
      try {
        dateParsed = this.dateService.format(new Date(value), environment.formatDate);
      } catch (error) {
        console.warn(error);
        dateParsed = this.dateService.format(new Date(), environment.formatDate);
      }
      return dateParsed;
    }
  }
}
