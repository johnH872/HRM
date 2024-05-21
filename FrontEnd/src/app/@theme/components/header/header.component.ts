import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import { NbAuthJWTToken, NbAuthService, NbTokenService } from '@nebular/auth';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { EmployeeManagementService } from 'src/app/modules/admin/employee-management/employee-management.service';
import { AddEditEmployeeComponent } from 'src/app/modules/admin/employee-management/add-edit-employee/add-edit-employee.component';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { NotificationService } from './notification.service';
import { NotificationModel } from './notification.model';
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";
import { getToken } from '@firebase/messaging/dist/src/api';
import { SocketService } from 'src/app/socket.service';

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
  notifications: NotificationModel[] = [];
  totalUnreadNoti: number = 0;
  firebaseConfig: any;
  firebaseApp: any;
  firebaseMessaging: any;
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
    private employeeService: EmployeeManagementService,
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {
    this.authService.onTokenChange().pipe(takeUntil(this.destroy$))
      .subscribe(async (token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.userLoggedIn = token.getPayload()?.user;
          this.userDetail = (await lastValueFrom(this.employeeService.getEmployeeById(this.userLoggedIn.userId))).result;
        }
      });
  }

  ngOnInit() {
    this.initFirebaseCloud();
    this.initData();
    this.initSocket()
    this.menuServiceObservable = this.menuService.onItemClick().subscribe(async (event) => {
      var model = (await lastValueFrom(this.employeeService.getEmployeeById(this.userLoggedIn?.userId))).result;
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
            var response = await lastValueFrom(this.employeeService.getEmployeeById(this.userLoggedIn?.userId));
            if (response.result) this.userDetail = response.result;
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

  async initData() {
    this.notifications = (await lastValueFrom(this.notificationService.GetAllNotification(this.userLoggedIn.userId))).result;
    if (this.notifications?.length > 0) this.totalUnreadNoti = this.notifications.filter(x => !x.isRead).length;
  }

  initSocket() {
    this.socketService.setupSocketConnection();
    // Save facematcher data
    this.socketService.socket.on('NOTIFICATION', (data: any) => {
      if(data?.userIds?.includes(this.userLoggedIn.userId)) this.initData();
    });
  }

  async initFirebaseCloud() {
    // this.firebaseConfig = (await lastValueFrom(this.notificationService.getFirebaseConfig()));
    // this.firebaseApp = initializeApp(this.firebaseConfig);
    // this.firebaseMessaging = getMessaging(this.firebaseApp);
    // getToken(this.firebaseMessaging, { vapidKey: "BIshw6XB_GQsrX_MMQsB-BToFf9LiFiklZDs1ddRXiO0nYLX7OA7kPCcZUL3TpizBBGGm9w_WTKpG3b07jyxVvA" }).then((currentToken) => {
    //   if (currentToken) {
    //     this.notificationService.saveFCMToken(this.userLoggedIn.userId, currentToken);
    //   } else {
    //     console.log('No registration token available. Request permission to generate one.');
    //   }
    // }).catch((err) => {
    //   console.log('An error occurred while retrieving token. ', err);
    // });
  }

  ngOnDestroy() {
    if (this.menuServiceObservable != null) {
      this.menuServiceObservable.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.disconnect();
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

  markAllNotifications() {
    this.notificationService.markRead(this.userDetail.userId).subscribe(res => {
      if (res.result) {
        this.messageService.add({
          key: 'toast1', severity: 'success', summary: 'Success',
          detail: `Mark all as read successfully!`, life: 2000
        });
        this.initData()
      }
    });
  }

  navigateUrl(noti: NotificationModel) {
    if (!noti.isRead) this.notificationService.markRead(this.userDetail.userId, noti.notificationId).subscribe(res => {
      if (res.result) this.notificationService.GetAllNotification(this.userLoggedIn.userId).subscribe(res => {
        this.initData()
      })
    });

    if (noti.redirectUrl) this.router.navigateByUrl(noti.redirectUrl as string);
  }
}
