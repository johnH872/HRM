import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'checkColorToday'
})
export class CheckColorTodayPipe implements PipeTransform {

  transform(value: string, mode: string, year: string): string {
    if (value) {
      const today = moment();
      const currentYear = new Date(year).getFullYear();
      if (mode === 'Month') {
        if (value === today.format('M/DD')) return 'today';
        else {
          var dateToCheck = moment(value, 'M/DD').year(currentYear);
          if (dateToCheck.day() === 6 || dateToCheck.day() === 0) return 'weekend';
        }
      } else {
        if (value === today.format('ddd, MMM D')) return 'today';
        else {
          var dateToCheck = moment(value, 'ddd, MMM D').year(currentYear);
          if (dateToCheck.day() === 6 || dateToCheck.day() === 0) return 'weekend';
        }
      }
    }
  }
}
