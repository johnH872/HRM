import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightTextSearching'
})
export class HighlightTextSearchingPipe implements PipeTransform {

  transform(value: any, args: string): any {
    if (!args) {
      return value;
    }
    args = args.trim().toLowerCase();
    const regex = new RegExp(args, 'gi');
    const match = value.match(regex);
    if (!match) {
      return value;
    }
    return value.replace(regex, `<span class='highlight'>${match[0]}</span>`);
  }
}
