import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttendanceManagementService } from '../../attendance-managment/attendance-management.service';
import { MessageService } from 'primeng/api';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { LeaveEntitlementManagamentService } from '../../leave-entitlement-managament/leave-entitlement-management.service';
import { LeaveEntitlementModel } from '../../leave-entitlement-managament/leave-entitlement-management.model';
import { LeaveTypeManagementService } from '../../leave-type-management/leave-type-management.service';
import { LeaveTypeModel } from '../../leave-type-management/leave-type-management.model';
import { Subject, lastValueFrom, takeUntil } from 'rxjs';
import { LeaveType } from 'src/app/modules/shared/enum/leave-type.enum';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { RangeDate } from 'src/app/modules/shared/models/dateRangeModel';
import dateFormat from "dateformat";
import { AttendanceModel } from '../../attendance-managment/attendance.model';
import { PagingRangeDateFilter } from 'src/app/modules/shared/models/page';

@Component({
  selector: 'app-employee-detail-dialog',
  templateUrl: './employee-detail-dialog.component.html',
  styleUrls: ['./employee-detail-dialog.component.scss']
})
export class EmployeeDetailDialogComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  employeeModel: EmployeeModel;
  leaveEntitlements: LeaveEntitlementModel[] = [];
  annualLeaveEntitlement: LeaveEntitlementModel;
  seniorityLeaveEntitlement: LeaveEntitlementModel;
  transferLeaveEntitlement: LeaveEntitlementModel;
  unpaidLeaveEntitlement: LeaveEntitlementModel;
  leaveTypes: LeaveTypeModel[] = [];
  usedAnnualLeavePercentage: number = null;
  usedSeniorityLeavePercentage: number = null;
  usedUnpaidLeavePercentage: number = null;
  usedTransferLeavePercentage: number = null;

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

  constructor(
    public dialModalRef: MatDialogRef<EmployeeDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private leaveEntitlementService: LeaveEntitlementManagamentService,
    private leaveTypeService: LeaveTypeManagementService,
    private messageService: MessageService,
    private frmBuilder: RxFormBuilder,
    private attendanceService: AttendanceManagementService,
  ) {
    if (this.data.model) this.employeeModel = this.data.model;
  }

  async ngOnInit() {
    await this.initData();
  }

  async initData() {
    this.rangeWeekDefault = { 
      startDate: dateFormat(this.getStartOfWeek(), 'mm-dd-yyyy 0:00:00'), 
      endDate: dateFormat(this.getEndOfWeek(), 'mm-dd-yyyy 23:59:59') 
    } as RangeDate;
    this.frmDateRange.setValue({ startDate: this.getStartOfWeek().toString(), endDate: this.getEndOfWeek().toString() });
    this.leaveEntitlementService.getLeaveEntitlementByEmployeeId(this.employeeModel.userId).subscribe(res => {
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
    await this.setupChart();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async setupChart() {
    this.isLoadingChart = !this.isLoadingChart;
    var listDurationWeeks = [];
    var listWeeks = [];
    if (this.frmDateRange.valid) {
      this.timeRangeDisplay = this.getMonthName(this.frmDateRange.get('startDate')?.value) + ' ' 
                                + this.getDateName(this.frmDateRange.get('startDate')?.value) + ' - ' 
                                + this.getMonthName(this.frmDateRange.get('endDate')?.value) + ' ' 
                                + this.getDateName(this.frmDateRange.get('endDate')?.value);
      var startDateValue = new Date(this.frmDateRange.get('startDate')?.value);
      startDateValue.setHours(0, 0, 0);
      var endDateValue = new Date(this.frmDateRange.get('endDate')?.value);
      endDateValue.setHours(23, 59, 59);
      var rangeWeek = { 
        startDate: startDateValue.toISOString(), 
        endDate: endDateValue.toISOString() 
      } as RangeDate;
      this.pagingAttendanceRange.rangeDateValue = rangeWeek;
      var respAttendanceWeek = await this.attendanceService.getAttendanceRange(this.employeeModel?.userId, this.pagingAttendanceRange).pipe(takeUntil(this.destroy$)).toPromise();
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

  closeDialog() {
    this.dialModalRef.close(false);
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
}
