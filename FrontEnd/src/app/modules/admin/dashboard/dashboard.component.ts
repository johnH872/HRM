import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Subject, lastValueFrom, takeUntil } from 'rxjs';
import { RangeDate } from '../../shared/models/dateRangeModel';
import { EChartsOption } from 'echarts';
import { AttendanceModel } from '../attendance-managment/attendance.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PagingRangeDateFilter } from '../../shared/models/page';
import dateFormat from "dateformat";
import { AttendanceManagementService } from '../attendance-managment/attendance-management.service';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { LeaveTypeModel } from '../leave-type-management/leave-type-management.model';
import { LeaveEntitlementManagamentService } from '../leave-entitlement-managament/leave-entitlement-management.service';
import { LeaveType } from '../../shared/enum/leave-type.enum';
import { LeaveEntitlementModel } from '../leave-entitlement-managament/leave-entitlement-management.model';
import { EmployeeManagementService } from '../employee-management/employee-management.service';
import { ReportAttendanceModel } from '../../face-recog/punch-in-out-webcam/report-attendance-dialog/report-attendance.model';
import { DashBoardData } from './dashboard-data.model';
import { LeaveRequestStatus } from '../../shared/enum/leave-request-status.enum';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';
import { ReportAttendanceDialogComponent } from '../../face-recog/punch-in-out-webcam/report-attendance-dialog/report-attendance-dialog.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { AddEditLeaveRequestComponent } from '../leave-request-management/add-edit-leave-request/add-edit-leave-request.component';
import { LeaveRequestModel } from '../leave-request-management/leave-request-management.model';
import { DialogGetReasonRejectedComponent } from '../leave-request-management/dialog-get-reason-rejected/dialog-get-reason-rejected.component';
import { LeaveRequestManagementService } from '../leave-request-management/leave-request-management.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy {
  userModel: any;
  // e-charts data
  order: number = 0;
  rangeWeekDefault: RangeDate;
  isApply = false;
  chartOption: EChartsOption;
  isLoadingChart: boolean = false;
  listAttendanceWeeks: AttendanceModel[] = [];
  listTypeOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  totalDurationWeekDisplay: string = '';
  timeRangeDisplay: string = '';
  frmDateRange = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required])
  });
  pagingAttendanceRange = new PagingRangeDateFilter();
  // Leave budget data
  leaveTypes: LeaveTypeModel[] = [];
  annualLeaveEntitlement: LeaveEntitlementModel;
  seniorityLeaveEntitlement: LeaveEntitlementModel;
  transferLeaveEntitlement: LeaveEntitlementModel;
  unpaidLeaveEntitlement: LeaveEntitlementModel;
  usedAnnualLeavePercentage: number = null;
  usedSeniorityLeavePercentage: number = null;
  usedUnpaidLeavePercentage: number = null;
  usedTransferLeavePercentage: number = null;
  //Order list data
  dashboardData: DashBoardData = new DashBoardData;
  isLoadingDashboard: boolean = false;
  firstDayOfMonth: Date = new Date();
  lastDayOfMonth: Date = new Date();

  private destroy$: Subject<void> = new Subject<void>();
  constructor(
    private attendanceService: AttendanceManagementService,
    private authService: NbAuthService,
    private nbAuthJwtToken: NbAuthJWTToken,
    private leaveEntitlementService: LeaveEntitlementManagamentService,
    private employeeService: EmployeeManagementService,
    private leaveRequestService: LeaveRequestManagementService,
    private messageService: MessageService,
    private dialog: MatDialog
  ) {
    this.authService.onTokenChange().pipe(takeUntil(this.destroy$))
      .subscribe(async (token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.userModel = token.getPayload().user;
        }
      });

    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    this.firstDayOfMonth = new Date(y, m, 1);
    this.lastDayOfMonth = new Date(y, m + 1, 0, 23, 59, 59);
  }

  ngOnInit(): void {

    if (!this.userModel) this.userModel = this.nbAuthJwtToken.getPayload().user;
    this.initChartData();
    this.initListData();

  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.next();
  }

  refreshData() {
    this.initListData();
  }

  initListData() {
    this.isLoadingDashboard = true;
    this.employeeService.getDashboardData(this.userModel.userId, this.userModel.email).subscribe(res => {
      if (res.result) {
        this.dashboardData = res.result;
        this.isLoadingDashboard = false;

      }
    })
  }

  async initChartData() {
    this.leaveEntitlementService.getLeaveEntitlementByEmployeeId(this.userModel.userId).subscribe(res => {
      if (res.result && res.result.length > 0) {
        res.result.forEach(element => {
          switch (element.leaveTypeId) {
            case LeaveType.Annually:
              this.annualLeaveEntitlement = element;
              this.usedAnnualLeavePercentage = ((element.usableLeave - element.usedLeave) / element.usableLeave * 100);
              break;
            case LeaveType.Seniority:
              this.seniorityLeaveEntitlement = element;
              this.usedSeniorityLeavePercentage = ((element.usableLeave - element.usedLeave) / element.usableLeave * 100);
              break;
            case LeaveType.Transfer:
              this.transferLeaveEntitlement = element;
              this.usedTransferLeavePercentage = ((element.usableLeave - element.usedLeave) / element.usableLeave * 100);
              break;
            case LeaveType.UnPaid:
              this.unpaidLeaveEntitlement = element;
              this.usedUnpaidLeavePercentage = ((element.usableLeave - element.usedLeave) / element.usableLeave * 100);
              break;
          }
        });
      }
    });

    this.rangeWeekDefault = {
      startDate: dateFormat(this.getStartOfWeek(), 'mm-dd-yyyy 0:00:00'),
      endDate: dateFormat(this.getEndOfWeek(), 'mm-dd-yyyy 23:59:59')
    } as RangeDate;
    this.frmDateRange.setValue({ startDate: this.getStartOfWeek().toString(), endDate: this.getEndOfWeek().toString() });
    await this.setupChart();
  }

  // Atttendance chart zone
  async setupChart() {
    this.isLoadingChart = !this.isLoadingChart;
    var listDurationWeeks = [];
    var listWeeks = [];
    if (this.frmDateRange.valid) {
      this.timeRangeDisplay = this.getMonthName(this.frmDateRange.get('startDate')?.value) + ' '
        + this.getDateName(this.frmDateRange.get('startDate')?.value)
        + `, ${this.getYearName(this.frmDateRange.get('endDate')?.value)}` + ' - '
        + this.getMonthName(this.frmDateRange.get('endDate')?.value) + ' '
        + this.getDateName(this.frmDateRange.get('endDate')?.value)
        + `, ${this.getYearName(this.frmDateRange.get('endDate')?.value)}`;
      var startDateValue = new Date(this.frmDateRange.get('startDate')?.value);
      startDateValue.setHours(0, 0, 0);
      var endDateValue = new Date(this.frmDateRange.get('endDate')?.value);
      endDateValue.setHours(23, 59, 59);
      var rangeWeek = {
        startDate: startDateValue.toISOString(),
        endDate: endDateValue.toISOString()
      } as RangeDate;
      this.pagingAttendanceRange.rangeDateValue = rangeWeek;
      var respAttendanceWeek = await lastValueFrom(this.attendanceService.getAttendanceRange(this.userModel?.userId, this.pagingAttendanceRange).pipe(takeUntil(this.destroy$)));
      if (respAttendanceWeek.result && respAttendanceWeek.result.length > 0) {
        this.listAttendanceWeeks = respAttendanceWeek.result;
      }
      const startDate = new Date(this.frmDateRange.get('startDate')?.value);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(this.frmDateRange.get('endDate')?.value);
      endDate.setHours(0, 0, 0, 0);
      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);
      while (currentDate <= endDate) {
        var totalDuration = 0;
        this.listAttendanceWeeks.map(item => {
          var punchInDate = new Date(item.punchinDate);
          if (punchInDate?.getDate() === currentDate?.getDate() && punchInDate?.getMonth() === currentDate?.getMonth()
            && punchInDate?.getFullYear() === currentDate?.getFullYear()) {
            totalDuration += item.duration;
          }
        })
        listDurationWeeks.push(Number(totalDuration.toFixed(2)));
        listWeeks.push(this.listTypeOfWeek[currentDate.getDay()]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    var totalDurationWeek = 0;
    listDurationWeeks.map(item => totalDurationWeek += item);
    this.totalDurationWeekDisplay = Math.floor(totalDurationWeek) + 'h' + Math.round((totalDurationWeek % 1) * 60) + 'm';

    const yMax = 25;
    const dataShadow = [];

    for (let i = 0; i < listDurationWeeks.length; i++) {
      dataShadow.push(yMax);
    }

    this.chartOption = {
      title: {
        left: '15%',
        subtext: 'Total duration: ' + this.totalDurationWeekDisplay,
        textAlign: 'center',
      },
      // color: ['#8dc63f'],
      xAxis: [
        {
          type: 'category',
          data: listWeeks,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          // For shadow
          type: 'bar',
          itemStyle: {
            color: 'rgba(0,0,0,0.05)',
          },
          barGap: '-100%',
          barCategoryGap: '40%',
          barWidth: '20%',
          data: dataShadow,
          animation: false,
        },
        {
          type: 'bar',
          barWidth: '20%',
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => this.formatDurationEchart(params.value),
          },
          itemStyle: {
            // normal: {
            //   barBorderRadius: [5, 5, 0, 0]
            // },
          },
          data: listDurationWeeks.map((duration) => ({
            value: duration,
            itemStyle: {
              color: this.handleDisplayDurationEchart(duration),
            },
          })),
        },
      ],
    };
    this.isLoadingChart = !this.isLoadingChart;
  }

  async setupDataFilter(value) {
    switch (value) {
      case 'prev':
        this.order -= 1;
        break;
      case 'next':
        this.order += 1;
        break;
      case 'this':
        this.order = 0;
        break;
    }
    var startDateValue = new Date(this.rangeWeekDefault.startDate);
    var endDateValue = new Date(this.rangeWeekDefault.endDate);
    startDateValue.setDate(startDateValue.getDate() + this.order * 7);
    endDateValue.setDate(endDateValue.getDate() + this.order * 7);
    this.frmDateRange.setValue(
      {
        startDate: startDateValue.toString(),
        endDate: endDateValue.toString()
      }
    );
    await this.setupChart();
  }

  getStartOfWeek(): Date {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    const startDayOfWeek = 1;

    const diff = (currentDayOfWeek >= startDayOfWeek ? currentDayOfWeek - startDayOfWeek : 7 - startDayOfWeek + currentDayOfWeek);
    const startWeek = new Date(currentDate);
    startWeek.setDate(currentDate.getDate() - diff);

    return startWeek;
  }

  getEndOfWeek(): Date {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    const endDayOfWeek = 0;

    const diff = (endDayOfWeek >= currentDayOfWeek ? endDayOfWeek - currentDayOfWeek : 7 - currentDayOfWeek + endDayOfWeek);
    const endWeek = new Date(currentDate);
    endWeek.setDate(currentDate.getDate() + diff);

    return endWeek;
  }

  getDateName(date): string {
    const value = new Date(date);
    return value.getDate().toString();
  }

  getYearName(date): string {
    const value = new Date(date);
    return value.getFullYear().toString();
  }

  getMonthName(date): string {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const value = new Date(date);
    const monthIndex = value?.getMonth();
    return monthNames[monthIndex];
  }

  formatDurationEchart(value: number): string {
    if (value) {
      return Math.floor(value) + 'h' + Math.round((value % 1) * 60) + 'm';
    } else {
      return '0';
    }
  }

  handleDisplayDuration(attendance: AttendanceModel, isDisplayColor: boolean = false): string {
    if (isDisplayColor) {
      if (attendance?.punchoutDate) {
        if (attendance?.duration < 9.0) return '#ff0009';
        else if (attendance?.duration >= 10.0) return '#008080';
        else return '#8dc63f';
      } else return '#ffaa00';
    }
  }

  handleDisplayDurationEchart(duration: number): string {
    if (duration < 9.0) return '#ff0009';
    else if (duration >= 10.0) return '#008080';
    else return '#8dc63f';
  }

  rangeDateChange(event, value: boolean) {
    if (value === true) {
      if (event.value) {
        const rangeDay = new RangeDate();
        rangeDay.endDate = dateFormat(this.frmDateRange.value.endDate, 'mm-dd-yyyy 23:59:59');
        rangeDay.startDate = dateFormat(this.frmDateRange.value.startDate, 'mm-dd-yyyy 0:00:00');
        this.isApply = true;
      }
    } else this.isApply = false;
  }

  clearDate(event) {
    event.stopPropagation();
    this.frmDateRange.reset({ startDate: '', endDate: '' });
    this.isApply = true;
  }

  saveAttendanceReport(isApprove: boolean, attendanceReport: ReportAttendanceModel) {
    this.isLoadingDashboard = true;
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

  openReportDialog(attendanceReport: ReportAttendanceModel) {
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
    })
  }

  async openLeaveDialog(model: LeaveRequestModel = null) {
    const attendanceRef = this.dialog.open(AddEditLeaveRequestComponent, {
      disableClose: true,
      height: '100%',
      width: '600px',
      autoFocus: false,
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      data: {
        model: model,
        listEmployees: [],
        action: model === null ? TblActionType.Add : TblActionType.Edit,
      }
    });
    attendanceRef.afterClosed().subscribe(async response => {
      if (response) {
        this.refreshData();
      }
    });
  }

  saveLeaveRequest(isApprove: boolean = false, leaveModel: LeaveRequestModel) {
    this.isLoadingDashboard = true;
    leaveModel.status = isApprove ? LeaveRequestStatus.APPROVED : LeaveRequestStatus.REJECTED;
    if (!isApprove) {
      const dialogRef = this.dialog.open(DialogGetReasonRejectedComponent, {
        backdropClass: 'custom-backdrop',
        hasBackdrop: true,
      });

      dialogRef.afterClosed().subscribe(response => {
        if (response) {
          this.leaveRequestService.saveLeaveRequest(leaveModel).subscribe(resp => {
            if (resp.result) {
              this.messageService.add({
                key: 'toast1', severity: 'success', summary: 'Success',
                detail: `${isApprove ? 'Approved' : 'Rejected'} successfully!`, life: 2000
              });
            }
          }).add(() => {
            this.refreshData();
          });
        } else {
          this.refreshData();
        }
      });
    } else {
      this.leaveRequestService.saveLeaveRequest(leaveModel).subscribe(resp => {
        if (resp.result) {
          this.messageService.add({
            key: 'toast1', severity: 'success', summary: 'Success',
            detail: `${isApprove ? 'Approved' : 'Rejected'} successfully!`, life: 2000
          });
        }
      }).add(() => {
        this.refreshData();
      });
    }
  }
}
