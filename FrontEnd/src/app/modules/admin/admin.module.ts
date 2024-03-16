import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { ThemeModule } from 'src/app/@theme/theme.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { DatastateManagementComponent } from './datastate-management/datastate-management.component';
import { AddEditDatastateComponent } from './datastate-management/add-edit-datastate/add-edit-datastate.component';
import { ReportManagementComponent } from './report-management/report-management.component';
import { AddEditReportComponent } from './report-management/add-edit-report/add-edit-report.component';
import { WorkManagementComponent } from './work-management/work-management.component';
import { AddEditWorkComponent } from './work-management/add-edit-work/add-edit-work.component';
import { WorkApplyManagementComponent } from './work-management/work-apply-management/work-apply-management.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartsComponent } from './dashboard/charts/charts.component';
import { UserProfileComponent } from './work-management/user-profile/user-profile.component';
import { WorkApplyDialogComponent } from './work-management/work-apply-dialog/work-apply-dialog.component';
import { ApproveTaskerDialogComponent } from './work-management/approve-tasker-dialog/approve-tasker-dialog.component';
import { AppyWorkComponent } from './work-management/work-apply-dialog/appy-work/appy-work.component';
import { FindItemPipe } from './work-management/work-apply-dialog/appy-work/find-item.pipe';
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


@NgModule({
  declarations: [
    AdminComponent,
    UserManagementComponent,
    ProfileDialogComponent,
    DatastateManagementComponent,
    AddEditDatastateComponent,
    ReportManagementComponent,
    AddEditReportComponent,
    WorkManagementComponent,
    AddEditWorkComponent,
    WorkApplyManagementComponent,
    DashboardComponent,
    ChartsComponent,
    UserProfileComponent,
    WorkApplyDialogComponent,
    ApproveTaskerDialogComponent,
    AppyWorkComponent,
    FindItemPipe,
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
    AddEditLeaveRequestComponent
  ],
  imports: [
    ThemeModule,
    SharedModule,
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
