import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, lastValueFrom, takeUntil } from 'rxjs';
import { ReportAttendanceModel } from 'src/app/modules/face-recog/punch-in-out-webcam/report-attendance-dialog/report-attendance.model';
import { AttendanceManagementService } from '../attendance-management.service';
import { MessageService } from 'primeng/api';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { faGift } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { Table } from 'primeng/table';
import { LeaveRequestStatus } from 'src/app/modules/shared/enum/leave-request-status.enum';
import { ReportAttendanceDialogComponent } from 'src/app/modules/face-recog/punch-in-out-webcam/report-attendance-dialog/report-attendance-dialog.component';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { ConfirmModalComponent } from 'src/app/modules/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-attendance-report-management',
  templateUrl: './attendance-report-management.component.html',
  styleUrls: ['./attendance-report-management.component.scss']
})
export class AttendanceReportManagementComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: ReportAttendanceModel[];
  reportAttendanceModel: ReportAttendanceModel;
  userModel: EmployeeModel;
  allStatus = LeaveRequestStatus;

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedReports: ReportAttendanceModel[] | null;

  constructor(
    private attendanceService: AttendanceManagementService,
    private messageService: MessageService,
    private authService: NbAuthService,
    private dialog: MatDialog
  ) {
    this.authService.onTokenChange().pipe(takeUntil(this.destroy$))
      .subscribe(async (token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.userModel = token.getPayload().user;
        }
      });

  }

  async ngOnInit() {
    this.loading = !this.loading;
    await this.refreshData();
    this.loading = !this.loading;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async refreshData() {
    this.loading = !this.loading;
    var employeePagingResults = await lastValueFrom(this.attendanceService.getAllAttendanceReport(this.userModel.email).pipe(takeUntil(this.destroy$)));
    if (employeePagingResults.result) {
      this.dataTable = employeePagingResults.result;
    }
    this.loading = !this.loading;
  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  async reset() {
    this.first = 0;
    await this.refreshData();
  }

  pageChange(event) {
    this.first = event.first;
    this.rows = event.rows;
  }

  clear(table: Table) {
    table.clear();
  }

  deleteSelectedAttendanceReport() {
    var deleteIds = this.selectedReports.map(x => x.attendanceReportId);
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: 'auto',
      height: 'auto',
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        message: `Do you wish to remove ${deleteIds.length} item(s)?`
      }
    });
    dialogRef.afterClosed().subscribe(dialogRes => {
      this.attendanceService.deleteAttendanceReport(deleteIds).subscribe(res => {
        if (res.result) {
          this.messageService.add({
            key: 'toast1', severity: 'success', summary: 'Success',
            detail: `Delete successfully!`, life: 2000
          });
          this.refreshData();
        } else {
          this.messageService.add({
            key: 'toast1', severity: 'warn', summary: 'Warning',
            detail: `Failed!`, life: 2000
          });
        }
      })
    })
  }

  saveAttendanceReport(isApprove: boolean, attendanceReport: ReportAttendanceModel) {
    attendanceReport.statusId = isApprove ? LeaveRequestStatus.APPROVED : LeaveRequestStatus.REJECTED;
    this.attendanceService.saveAttendanceReport(attendanceReport, this.userModel.userId).subscribe(res => {
      if (res.result) {
        this.messageService.add({
          key: 'toast1', severity: 'success', summary: 'Success',
          detail: `${isApprove ? 'Approved' : 'Rejected'} successfully!`, life: 2000
        });
        this.refreshData();
      } else {
        this.messageService.add({
          key: 'toast1', severity: 'warn', summary: 'Warning',
          detail: `Failed!`, life: 2000
        });
      }
    });
  }

  openDetail(attendanceReport: ReportAttendanceModel) {
    const attendanceRef = this.dialog.open(ReportAttendanceDialogComponent, {
      width: 'auto',
      height: 'auto',
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        captureImg: attendanceReport.imageUrl,
        model: attendanceReport,
        action: TblActionType.Edit,
      }
    });
    attendanceRef.afterClosed().subscribe(response => {
      if (response) {
        this.messageService.add({
          key: 'toast1', severity: 'success', summary: 'Success',
          detail: `${response.isApprove ? 'Approved' : 'Rejected'} successfully!`, life: 2000
        });
        this.refreshData();
      }
    });
  }
}
