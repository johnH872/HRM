import { Component } from '@angular/core';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { MENU_ITEMS_ADMIN, MENU_ITEMS_EMPLOYEE } from './menu-items';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  user: any;
  menuAdmin = MENU_ITEMS_ADMIN;
  menuEmployee = MENU_ITEMS_EMPLOYEE;
  roleUser: string;

  constructor(private authService: NbAuthService) {
    this.authService.onTokenChange()
    .subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.user = token.getPayload()?.user; // here we receive a payload from the token and assigns it to our `user` variable 
        this.roleUser = this.user?.roles[0]?.roleName;
      }
    });
  }
}
