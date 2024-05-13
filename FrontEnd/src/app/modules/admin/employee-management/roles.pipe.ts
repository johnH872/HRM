import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roles'
})
export class RolesPipe implements PipeTransform {

  transform(roles: any): String {
    var result = ''
    if(roles && roles?.length >0) {
      var lstRoles = roles.map(x => x.displayName);
      result = lstRoles.join(', ');
    } 
    return result;
  }

}
