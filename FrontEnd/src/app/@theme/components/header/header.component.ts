import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import { NbAuthJWTToken, NbAuthService, NbTokenService } from '@nebular/auth';
import { Router } from '@angular/router';
import { ProfileDetail } from 'src/app/modules/shared/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { EmployeeManagementService } from 'src/app/modules/admin/employee-management/employee-management.service';
import { PunchInOutComponent } from 'src/app/modules/admin/attendance-managment/punch-in-out/punch-in-out.component';
import { AddEditEmployeeComponent } from 'src/app/modules/admin/employee-management/add-edit-employee/add-edit-employee.component';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  userLoggedIn: any;
  userDetail: EmployeeModel;
  menuServiceObservable: Subscription = null;
  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenu = [{ title: 'Profile', id: 'profile' }, { title: 'Log out', id: 'logout' }];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private authService: NbAuthService,
    private dialog: MatDialog,
    private messageService: MessageService,
    private tokenService: NbTokenService,
    private router: Router,
    private employeeService: EmployeeManagementService
  ) {
    this.authService.onTokenChange().pipe(takeUntil(this.destroy$))
      .subscribe(async (token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.userLoggedIn = token.getPayload();
          console.log(this.userLoggedIn)
          this.userDetail = (await lastValueFrom(this.employeeService.getEmployeeById(this.userLoggedIn.user.userId))).result;
        }
      });
  }

  ngOnInit() {
    this.menuServiceObservable = this.menuService.onItemClick().subscribe(async (event) => {
      var model =  (await lastValueFrom(this.employeeService.getEmployeeById(this.userLoggedIn.user.userId))).result;
      model.roleId = model.Roles.map(x => x.roleId);
      if (event.item['id'] === 'profile') {
        const dialogRef = this.dialog.open(AddEditEmployeeComponent, {
          width: '600px',
          height: '100vh',
          backdropClass: 'custom-backdrop',
          hasBackdrop: true,
          data: {
            model,
            action: TblActionType.Edit,
            listEmployees: [],
            isAdmin: false
          },
        });

        dialogRef.afterClosed().subscribe(async res => {
          if (res) {
            this.messageService.clear();
            this.messageService.add({
              key: 'toast1', severity: 'success', summary: 'Success',
              detail: `Change personal infor successfully!`, life: 2000
            });
            var response = await lastValueFrom(this.employeeService.getEmployeeById(this.userLoggedIn.user.userId));
            if(response.result) this.userDetail = response.result;
          }
        })
      }
      if (event.item['id'] === 'logout') {
        this.tokenService.clear();
        localStorage.clear();
        this.router.navigateByUrl("/auth");
      }
    })

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    if (this.menuServiceObservable != null) {
      this.menuServiceObservable.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
