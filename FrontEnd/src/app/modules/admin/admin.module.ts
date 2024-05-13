import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { ThemeModule } from 'src/app/@theme/theme.module';
import { DatastateManagementComponent } from './datastate-management/datastate-management.component';
import { AddEditDatastateComponent } from './datastate-management/add-edit-datastate/add-edit-datastate.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartsComponent } from './dashboard/charts/charts.component';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { AddEditEmployeeComponent } from './employee-management/add-edit-employee/add-edit-employee.component';
import { LeaveTypeManagementComponent } from './leave-type-management/leave-type-management.component';
import { AddEditLeaveTypeComponent } from './leave-type-management/add-edit-leave-type/add-edit-leave-type.component';
import { LeaveEntitlementManagamentComponent } from './leave-entitlement-managament/leave-entitlement-managament.component';
import { AddEditLeaveEntitlementComponent } from './leave-entitlement-managament/add-edit-leave-entitlement/add-edit-leave-entitlement.component';
import { AttendanceManagmentComponent } from './attendance-managment/attendance-managment.component';
import { PunchInOutComponent } from './attendance-managment/punch-in-out/punch-in-out.component';
import { WebcamComponent } from './attendance-managment/webcam/webcam.component';
import { LeaveRequestManagementComponent } from './leave-request-management/leave-request-management.component';
import { AddEditLeaveRequestComponent } from './leave-request-management/add-edit-leave-request/add-edit-leave-request.component';
import { TrainEmployeeComponent } from './employee-management/train-employee/train-employee.component';
import { ReportScheduleManagementComponent } from './report-schedule-management/report-schedule-management.component';
import { HandleDisplayColorPipe } from './report-schedule-management/handle-display-color.pipe';
import { CheckColorTodayPipe } from './report-schedule-management/check-color-today.pipe';
import { AttendanceReportManagementComponent } from './attendance-managment/attendance-report-management/attendance-report-management.component';
import { AddEditAttendanceComponent } from './attendance-managment/add-edit-attendance/add-edit-attendance.component';
import { EmployeeDetailDialogComponent } from './employee-management/employee-detail-dialog/employee-detail-dialog.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { RoleManagementComponent } from './role-management/role-management.component';
import { AddEditRoleComponent } from './role-management/add-edit-role/add-edit-role.component';
import { SettingManagementComponent } from './setting-management/setting-management.component';
import { AddEditSettingComponent } from './setting-management/add-edit-setting/add-edit-setting.component';
import { WorkCalendarManagementComponent } from './work-calendar-management/work-calendar-management.component';
import { AddEditWorkCalendarDetailComponent } from './work-calendar-management/add-edit-work-calendar-detail/add-edit-work-calendar-detail.component';
import { DialogGetReasonRejectedComponent } from './leave-request-management/dialog-get-reason-rejected/dialog-get-reason-rejected.component';
import { RolesPipe } from './employee-management/roles.pipe';


@NgModule({
  declarations: [
    AdminComponent,
    DatastateManagementComponent,
    AddEditDatastateComponent,
    DashboardComponent,
    ChartsComponent,
    EmployeeManagementComponent,
    AddEditEmployeeComponent,
    LeaveTypeManagementComponent,
    AddEditLeaveTypeComponent,
    LeaveEntitlementManagamentComponent,
    AddEditLeaveEntitlementComponent,
    AttendanceManagmentComponent,
    PunchInOutComponent,
    WebcamComponent,
    LeaveRequestManagementComponent,
    AddEditLeaveRequestComponent,
    TrainEmployeeComponent,
    ReportScheduleManagementComponent,
    HandleDisplayColorPipe,
    CheckColorTodayPipe,
    AttendanceReportManagementComponent,
    AddEditAttendanceComponent,
    EmployeeDetailDialogComponent,
    RoleManagementComponent,
    AddEditRoleComponent,
    SettingManagementComponent,
    AddEditSettingComponent,
    WorkCalendarManagementComponent,
    AddEditWorkCalendarDetailComponent,
    DialogGetReasonRejectedComponent,
    RolesPipe
  ],
  imports: [
    ThemeModule,
    SharedModule,
    CommonModule,
    AdminRoutingModule,
    NgCircleProgressModule.forRoot({
      "radius": 60,
      "space": -9,
      "outerStrokeGradient": false,
      "outerStrokeWidth": 7,
      "outerStrokeColor": "#4882c2",
      "innerStrokeWidth": 7,
      "innerStrokeColor": "#e7e8ea",
      "title": "",
      "subtitle": "Remains",
      "animateTitle": false,
      "animationDuration": 1000,
      "showUnits": false,
      "showBackground": false,
      "clockwise": false,
      "startFromZero": false,
      "lazy": true
    })
  ]
})
export class AdminModule { }
