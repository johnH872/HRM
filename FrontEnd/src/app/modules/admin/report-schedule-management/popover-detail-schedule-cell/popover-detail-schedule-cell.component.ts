import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NbAccessChecker } from '@nebular/security';
import { LeaveRequestManagementService } from '../../leave-request-management/leave-request-management.service';
import { SettingManagementService } from '../../setting-management/setting-management.service';
import { AddEditAttendanceComponent } from '../../attendance-managment/add-edit-attendance/add-edit-attendance.component';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { AddEditLeaveRequestComponent } from '../../leave-request-management/add-edit-leave-request/add-edit-leave-request.component';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';

@Component({
  selector: 'app-popover-detail-schedule-cell',
  templateUrl: './popover-detail-schedule-cell.component.html',
  styleUrls: ['./popover-detail-schedule-cell.component.scss']
})
export class PopoverDetailScheduleCellComponent implements OnInit {
  @Input() data: any;
  @Input() titleHeader: string = null;
  @Output() onRefresh = new EventEmitter<any>();

  user: any;
  isAdmin: boolean = false;
  listEmployees: EmployeeModel[] = [];
  lstAttendanceDetails: any[] = [];
  lstLeaveRequestDetails: any[] = [];
  bonusTypeId: number = 0;
  hasEditAttendancePermission: boolean = false;
  hasEditLeaveRequestPermission: boolean = false;
  hasSuperAdminPermission: boolean = false;

  constructor (
    private dialog: MatDialog,
    private settingService: SettingManagementService,
    private permissionService: NbAccessChecker,
    private leaveRequestService: LeaveRequestManagementService,
    private employeeService: EmployeeManagementService,
    private authService: NbAuthService,
  ) {
    this.employeeService.getAllEmployee().subscribe(res => {
      if (res.result) {
        this.listEmployees = res.result;
        this.listEmployees.map((employee) => {
          let fullName = `${employee.firstName} ${employee.middleName} ${employee.lastName}`;
          employee.displayName = fullName.trim() ? fullName : "Unknown";
        });
      }
    });
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.user = token.getPayload().user;
        if (this.user?.roles[0]?.roleName === 'admin') this.isAdmin = true;
      }
    });
    // this.permissionService.isGranted('view', 'edit-punchin-punchout').subscribe(e => this.hasEditAttendancePermission = e);
    // this.permissionService.isGranted('view', 'accept-leave-request').subscribe(e => this.hasEditLeaveRequestPermission = e);
    // this.permissionService.isGranted('view', 'super-admin-permission').subscribe(e => this.hasSuperAdminPermission = e);
  }

  async ngOnInit() {
    this.data?.map(item => {
      if (item?.attendanceId) this.lstAttendanceDetails?.push(item);
      if (item?.leaveRequestId) this.lstLeaveRequestDetails?.push(item);
    });
    await this.getListSettingLeaveType();
  }

  async getListSettingLeaveType() {
    var resp = await this.settingService.getSettingByGroup('LEAVE_TYPE').toPromise();
    if (resp.result) {
      this.bonusTypeId = Number(resp.result.find(item => item.key === 'BONUS_LEAVE_TYPE_ID')?.value);
    }
  }

  openAttendanceDetail(attendanceModel: any) {
    if (attendanceModel) {
      const dialogRef = this.dialog.open(AddEditAttendanceComponent, {
        disableClose: true,
        height: '100vh',
        width: '600px',
        panelClass: 'dialog-detail',
        autoFocus: false,
        data: {
          model: attendanceModel,
          action: TblActionType.Edit,
          listEmployees: this.listEmployees
        }
      });
      dialogRef.afterClosed().subscribe(response => {
        if (response) {
          this.onRefresh.emit(response);
        }
      });
    }
  }

  openLeaveRequestDetail(leaveRequestModel: any) {
    this.leaveRequestService.getLeaveRequestById(leaveRequestModel?.leaveRequestId).subscribe(resp => {
      if (resp.result) {
        const modelLeaveRequest = resp.result;
        const dialogRef = this.dialog.open(AddEditLeaveRequestComponent, {
          disableClose: true,
          height: '100vh',
          width: '600px',
          panelClass: 'dialog-detail',
          autoFocus: false,
          data: {
            model: modelLeaveRequest,
            action: TblActionType.Edit,
            listEmployees: this.listEmployees
          }
        });
        dialogRef.afterClosed().subscribe(response => {
          if (response) {
            this.onRefresh.emit(response);
          }
        });
      }
    });
  }
}