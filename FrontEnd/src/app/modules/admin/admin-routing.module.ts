import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DatastateManagementComponent } from './datastate-management/datastate-management.component';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { LeaveTypeManagementComponent } from './leave-type-management/leave-type-management.component';
import { LeaveEntitlementManagamentComponent } from './leave-entitlement-managament/leave-entitlement-managament.component';
import { AttendanceManagmentComponent } from './attendance-managment/attendance-managment.component';
import { PunchInOutComponent } from './attendance-managment/punch-in-out/punch-in-out.component';
import { LeaveRequestManagementComponent } from './leave-request-management/leave-request-management.component';
import { ReportScheduleManagementComponent } from './report-schedule-management/report-schedule-management.component';
import { AttendanceReportManagementComponent } from './attendance-managment/attendance-report-management/attendance-report-management.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { SettingManagementComponent } from './setting-management/setting-management.component';
import { WorkCalendarManagementComponent } from './work-calendar-management/work-calendar-management.component';

const routes: Routes = [{
  path: '',
  component: AdminComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'datastate',
      component: DatastateManagementComponent,
    },
    {
      path: 'employee',
      component: EmployeeManagementComponent,
    },
    {
      path: 'leave-type',
      component: LeaveTypeManagementComponent,
    },
    {
      path: 'leave-entitlement',
      component: LeaveEntitlementManagamentComponent,
    },
    {
      path: 'leave-request',
      component: LeaveRequestManagementComponent,
    },
    {
      path: 'report-schedule',
      component: ReportScheduleManagementComponent,
    },
    {
      path: 'work-calendar',
      component: WorkCalendarManagementComponent,
    },
    {
      path: 'attendances',
      component: AttendanceManagmentComponent,
    },
    {
      path: 'attendance-report',
      component: AttendanceReportManagementComponent,
    },
    {
      path: 'roles',
      component: RoleManagementComponent,
    },
    {
      path: 'settings',
      component: SettingManagementComponent,
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
