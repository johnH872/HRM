import { Time } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'handleDisplayColor'
})
export class HandleDisplayColorPipe implements PipeTransform {
  constructor() {
    
  }

  transform(value: string, mode: string, leave: string): string {
    if (value) {
      switch (mode) {
        case "Month":
          if (value) {
            value = value.replace(/,/g, "");
            if (Number(value) < 9.50) return '#ff0009';
            else if (Number(value) >= 10.50) return '#008080';
            else if (9.50 <= Number(value) && Number(value) < 10.50) return '#8dc63f';
          }
          break;
        default:
          if (value) {
            if (value.includes('??')) {
              return '#ffaa00';
            } else if (!value.includes('--')) {
              var findFirstIndex = value.indexOf('=');
              var findLastIndex = value.indexOf('h');
              if (findFirstIndex > -1 && findLastIndex > -1) {
                var duration = Number(value.substring(findFirstIndex + 1, findLastIndex).replace(/,/g, ""));
                if (leave) {
                  var findFirstIndexLeave = leave?.indexOf('(');
                  var findLastIndexLeave = leave?.indexOf('h)');
                  duration += Number(leave.substring(findFirstIndexLeave + 1, findLastIndexLeave).replace(/,/g, ""));
                  var firstIndex = leave?.indexOf(':');
                  var lastIndex = leave?.lastIndexOf(':');
                  var leaveTimeFrom: Time = {
                    hours: Number(leave.substring(0, firstIndex)),
                    minutes: Number(leave.substring(firstIndex + 1, firstIndex + 3)),
                  };
                  var leaveTimeTo: Time = {
                    hours: Number(leave.substring(lastIndex - 2, lastIndex)),
                    minutes: Number(leave.substring(lastIndex + 1, lastIndex + 3)),
                  };
                  var checkStartTime: Time = {
                    hours: 12,
                    minutes: 0,
                  };
                  var checkEndTime: Time = {
                    hours: 13,
                    minutes: 30,
                  };
                  if (leaveTimeFrom?.hours <= checkStartTime?.hours && checkEndTime?.hours <= leaveTimeTo?.hours) duration += 1.50;
                  else if ((leave.includes('09:00 - ') && leaveTimeTo.hours >= checkStartTime.hours) || 
                            leave.includes('13:30 - ')) duration += 1.50;
                }
                if (duration < 9.50) return '#ff0009';
                else if (duration >= 10.50) return '#008080';
                else return '#8dc63f';
              }
            }
          }
          break;
      }
    }
  }
}
