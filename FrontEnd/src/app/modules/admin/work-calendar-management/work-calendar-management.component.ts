import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReportScheduleModel } from '../report-schedule-management/report-schedule-management.model';
import { ReportScheduleDatum, ReportScheduleResult, WorkCalendarDatum, WorkCalendarResult } from '../../shared/models/report-schedule.model';
import { FilterConfig } from '../../shared/components/dropdown-filter/filter-config';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { ReportScheduleManagementService } from '../report-schedule-management/report-schedule-management.service';
import { EmployeeManagementService } from '../employee-management/employee-management.service';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
import { FilterType } from '../../shared/enum/filter-type.enum';
import { map, takeUntil } from 'rxjs';
import { MatOption } from '@angular/material/core';
import { DataFilterWorkCalendar } from './work-calendar-management.model';
import { WorkCalendarManagementService } from './work-calendar-management.service';
import { DataStateModel } from '../datastate-management/data-state.model';
import { DatastateService } from '../datastate-management/datastate.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-work-calendar-management',
  templateUrl: './work-calendar-management.component.html',
  styleUrls: ['./work-calendar-management.component.scss']
})
export class WorkCalendarManagementComponent implements OnInit {
  @ViewChild('dataTable') table: ElementRef;
  @ViewChild('matSelectStatus') matSelectStatus: MatSelect;

  user;
  frmGroup: FormGroup;
  timeMode = 'Week';
  viewMode = 'Both';
  typeMode = 'List';
  timeModeDisplay = 'This week';
  isLoading = false;
  dataFilterWorkCalendar: DataFilterWorkCalendar;
  data: WorkCalendarResult;
  dataSource : WorkCalendarDatum[] = [];
  headerData = [];
  headerData2 = [];
  footerData: WorkCalendarDatum;
  defaultHeader = ["userName"];
  listStatus = [
    { codeColor: "#ff0009", value: "red", display: "Short of hours (< 9h)" },
    { codeColor: "#ffaa00", value: "yellow", display: "Not punchout" },
    { codeColor: "#8dc63f", value: "green", display: "Normal (9h to 10h)" },
    { codeColor: "#008080", value: "purple", display: "Overtime (> 10h)" },
  ];
  listStatusLeave = [
    { codeColor: "#996600", value: "noPaid", display: "Unpaid Leave" },
    { codeColor: "#3366cc", value: "paid", display: "Paid Leave" },
  ];
  listStatusRole = [
    { codeColor: "#cc9966", value: "37461060-43d3-42f4-8967-f0ecf7f67f71", display: "Internship" },
    { codeColor: "#df9aad", value: "95386088-fc73-4a2e-a64d-d3e73a4c07ff", display: "Employee" },
  ];
  listStatusChoose: string[] = [];
  listStatusLeaveChoose: string[] = [];
  listStatusRoleChoose: string[] = [];
  configFilterEmployee: FilterConfig;
  configFilterRole: FilterConfig;
  isMyEmployee: boolean = false;
  listOwners: string[] = [];
  btnExportState = false;

  lstWorkType: DataStateModel[] = [];
  lstWorkHours: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  
  constructor(
    private frmBuilder: RxFormBuilder,
    private workCalendarService: WorkCalendarManagementService,
    private userService: EmployeeManagementService,
    private authService: NbAuthService,
    private router: Router,
    private toast: NbToastrService,
    private dataStateService: DatastateService,
  ) { 
    this.dataFilterWorkCalendar = new DataFilterWorkCalendar();
    this.configFilterEmployee = {
      filterType: FilterType.DropDown,
      filterValue: this.userService.getAllEmployee().pipe(map(x => {
        if (x.result) {
          return x.result.map(item => Object.assign({ text: `${item?.firstName} ${item?.lastName}`, value: item?.userId }));
        } else return [];
      })),
      displayText: 'text',
      displayValue: 'value',
      firstLoad: true
    } as FilterConfig;
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.user = token.getPayload();
      }
    });
    // this.configFilterRole = {
    //   filterType: FilterType.DropDown,
    //   filterValue: this.userService.getAllRoles().pipe(map(x => {
    //     if (x.result) {
    //       x.result.map(item => {
    //         var indexRole = this.listStatusRole.findIndex(role => role.display === item.displayName);
    //         if (indexRole > -1) this.listStatusRole[indexRole].value = item.id;
    //       });
    //       return x.result.map(item => Object.assign({ text: `${item?.displayName}`, value: item.id }));
    //     } else return [];
    //   })),
    //   displayText: 'text',
    //   displayValue: 'value',
    //   firstLoad: true
    // } as FilterConfig;
    this.userService.getAllEmployee();
    this.dataStateService.getDataStateByType('WORK_TYPE').subscribe(resp => {
      if (resp.result) {
        this.lstWorkType = resp.result;
      }
    });
  }

  async ngOnInit() {
    await this.initialData();
  }

  async initialData() {
    const attendanceReportStatus = window.localStorage.getItem('attendanceReportStatus');
    attendanceReportStatus == null ? this.listStatus.map(item => this.listStatusChoose?.push(item?.value)) : this.listStatusChoose = attendanceReportStatus?.split(',');
    const attendanceReportLeaveStatus = window.localStorage.getItem('attendanceReportLeaveStatus');
    attendanceReportLeaveStatus == null ? this.listStatusLeave.map(item => this.listStatusLeaveChoose?.push(item?.value)) : this.listStatusLeaveChoose = attendanceReportLeaveStatus?.split(',');
    const attendanceReportRoleStatus = window.localStorage.getItem('attendanceReportRoleStatus');
    attendanceReportRoleStatus == null ? this.listStatusRole.map(item => this.listStatusRoleChoose?.push(item?.value)) : (attendanceReportRoleStatus == '' ? this.listStatusRoleChoose = [] : this.listStatusRoleChoose = attendanceReportRoleStatus?.split(','));
    await this.changeAttendanceReportMode();
    this.frmGroup = this.frmBuilder.formGroup(DataFilterWorkCalendar, this.dataFilterWorkCalendar);
  }

  async callDataSource() {
    this.isLoading = !this.isLoading;
    const result = await this.workCalendarService.getWorkCalendar(this.frmGroup.value).toPromise();
    if (result.result) {
      this.data = result.result;
      this.headerData = [];
      this.data.column.forEach(element => {
        this.headerData.push(...element.month)
      });
      this.headerData2 = [...this.defaultHeader, ...new Set(this.headerData.map(e => { return e.key }))];
      this.dataSource = [];
      this.setupData(this.data.data, this.dataSource);
      // this.footerData = {...this.dataSource[this.dataSource.length - 1]};
      // this.dataSource.pop();
    }
    this.isLoading = !this.isLoading;
  }

  setupData(input: WorkCalendarDatum[], output: WorkCalendarDatum[]) {
    for (var idx = 0; idx < input.length; idx++) {
      input[idx].workCalendarMonthly?.map(item => input[idx] = {...input[idx], ...item});
      output.push(...[input[idx]]);
    }
  }

  async changeAttendanceReportMode(changeMode: boolean = false) {
    const currentDate = new Date();
    this.dataFilterWorkCalendar.order = changeMode ? 0 : this.dataFilterWorkCalendar.order;
    switch (this.timeMode) {
      case "Week":
        this.timeModeDisplay = "This week";
        this.dataFilterWorkCalendar.fromDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
        this.dataFilterWorkCalendar.toDate = new Date(currentDate.setDate(currentDate.getDate() + (7 - currentDate.getDay())));
        this.dataFilterWorkCalendar.fromDate.setDate(this.dataFilterWorkCalendar.fromDate.getDate() + this.dataFilterWorkCalendar.order * 7);
        this.dataFilterWorkCalendar.toDate.setDate(this.dataFilterWorkCalendar.toDate.getDate() + this.dataFilterWorkCalendar.order * 7);
        break;
      case "Day":
        this.timeModeDisplay = "Today";
        this.dataFilterWorkCalendar.fromDate = new Date(currentDate);
        this.dataFilterWorkCalendar.toDate = new Date(currentDate);
        this.dataFilterWorkCalendar.fromDate.setDate(this.dataFilterWorkCalendar.fromDate.getDate() + this.dataFilterWorkCalendar.order);
        this.dataFilterWorkCalendar.toDate.setDate(this.dataFilterWorkCalendar.toDate.getDate() + this.dataFilterWorkCalendar.order);
        break;
      case "Month":
        this.timeModeDisplay = "This month";
        this.dataFilterWorkCalendar.fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + this.dataFilterWorkCalendar.order, 1);
        this.dataFilterWorkCalendar.toDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1 + this.dataFilterWorkCalendar.order, 0);
        break;
    }
    this.dataFilterWorkCalendar.fromDate.setHours(0, 0, 0);
    this.dataFilterWorkCalendar.toDate.setHours(23, 59, 59);
    this.dataFilterWorkCalendar.timeMode = this.timeMode;
    this.dataFilterWorkCalendar.listStatus = this.listStatusChoose;
    this.dataFilterWorkCalendar.listStatusLeave = this.listStatusLeaveChoose;
    this.dataFilterWorkCalendar.listRoles = this.listStatusRoleChoose;
    this.frmGroup = this.frmBuilder.formGroup(DataFilterWorkCalendar, this.dataFilterWorkCalendar);
    await this.callDataSource();
  }

  async refreshData() {
    this.isMyEmployee = false;
    this.matSelectStatus?.options?.forEach((data: MatOption) => data.deselect());
    this.frmGroup.reset();
    this.listStatusChoose = [];
    this.listStatusLeaveChoose = [];
    this.listStatusRoleChoose = [];
    this.dataFilterWorkCalendar.order = 0;
    this.dataFilterWorkCalendar.listProfile = [];
    this.dataFilterWorkCalendar.listRoles = [];
    this.listStatus.map(item => this.listStatusChoose?.push(item?.value));
    window.localStorage.setItem('attendanceReportStatus', `${this.listStatusChoose}`);
    this.listStatusLeave.map(item => this.listStatusLeaveChoose?.push(item?.value));
    window.localStorage.setItem('attendanceReportLeaveStatus', `${this.listStatusLeaveChoose}`);
    // this.listStatusRole.map(item => this.listStatusRoleChoose?.push(item?.value));
    window.localStorage.setItem('attendanceReportRoleStatus', `${this.listStatusRoleChoose}`);
    this.dataFilterWorkCalendar.listStatus = this.listStatusChoose;
    this.dataFilterWorkCalendar.listStatusLeave = this.listStatusLeaveChoose;
    this.dataFilterWorkCalendar.listRoles = this.listStatusRoleChoose;
    await this.changeAttendanceReportMode();
  }

  async refreshThis() {
    this.dataFilterWorkCalendar.order = 0;
    await this.changeAttendanceReportMode();
  }

  async prevData() {
    this.dataFilterWorkCalendar.order -= 1;
    await this.changeAttendanceReportMode();
  }

  async nextData() {
    this.dataFilterWorkCalendar.order += 1;
    await this.changeAttendanceReportMode();
  }

  async applyFilter() {
    this.dataFilterWorkCalendar.order = 0;
    this.dataFilterWorkCalendar.fromDate = this.frmGroup?.get('fromDate')?.value;
    this.dataFilterWorkCalendar.toDate = this.frmGroup?.get('toDate')?.value;
    this.dataFilterWorkCalendar.listStatus = this.listStatusChoose;
    this.dataFilterWorkCalendar.listStatusLeave = this.listStatusLeaveChoose;
    this.frmGroup.get('listProfile').setValue(this.dataFilterWorkCalendar?.listProfile);
    this.frmGroup.get('listStatus').setValue(this.dataFilterWorkCalendar?.listStatus);
    this.frmGroup.get('listRoles').setValue(this.dataFilterWorkCalendar?.listRoles);
    this.frmGroup.get('listStatusLeave').setValue(this.dataFilterWorkCalendar?.listStatusLeave);
    await this.callDataSource();
  }

  async exportData(mode: boolean) {
    this.btnExportState = !this.btnExportState;
    // var model = new AttendanceReportExportModel();
    // this.frmGroup.get('listProfile').setValue(this.dataFilterWorkCalendar?.listProfile);
    // this.frmGroup.get('listRoles').setValue(this.dataFilterWorkCalendar?.listRoles);
    // const result = await this.attendanceService.getAttendanceReport(this.frmGroup.value).toPromise();
    // if (result.result) {
    //   var data = result.result;
    //   var headerData = [];
    //   data.column.forEach(element => {
    //     headerData.push(...element.month)
    //   });
    //   var dataSource = [];
    //   this.setupData(data?.data, dataSource);
    //   dataSource.pop();
    //   model.data = dataSource;
    // }
    // model.dataFilter = this.dataFilterWorkCalendar;
    // var respExport = mode ? await this.attendanceService.exportDetailAttendanceReport(model).toPromise() : await this.attendanceService.exportAttendanceReport(model).toPromise();
    // if (respExport.result) {
    //   Helper.downloadFile(respExport.result);
    // }
    this.btnExportState = !this.btnExportState;
  }

  onFilterDropDownEmployee(event) {
    if (event) {
      this.dataFilterWorkCalendar.listProfile = event;
    }
  }

  onFilterDropDownRole(event) {
    if (event) {
      this.dataFilterWorkCalendar.listRoles = event;
      this.listStatusRoleChoose = [];
      this.dataFilterWorkCalendar?.listRoles?.map(role => {
        var index = this.listStatusRole.findIndex(item => item.value === role);
        if (index > -1) {
          this.listStatusRoleChoose.push(role);
        }
      });
    }
  }

  async getMyEmployeeAttendance(event: boolean) {
    this.isMyEmployee = event;
    if (event) {
      var resultOwner = await this.userService.getOwnersByEmployeeId(this.user?.nameid).toPromise();
      if (resultOwner.result) {
        this.listOwners = resultOwner.result.map(item => item.userId);
        this.dataFilterWorkCalendar.listRoles = [];
        this.listStatusRoleChoose = [];
        this.dataFilterWorkCalendar.listProfile = [];
        this.dataFilterWorkCalendar.listProfile = this.dataFilterWorkCalendar?.listProfile?.concat(this.listOwners);
      }
    } else {
      this.dataFilterWorkCalendar.listProfile = this.dataFilterWorkCalendar?.listProfile?.filter(item => !this.listOwners.includes(item));
      this.listOwners = [];
    }
    this.frmGroup.get('listProfile').setValue(this.dataFilterWorkCalendar?.listProfile);
    this.frmGroup.get('listRoles').setValue(this.dataFilterWorkCalendar?.listRoles);
    await this.callDataSource();
  }

  async changeStatus(event: any) {
    window.localStorage.setItem('attendanceReportStatus', `${this.listStatusChoose}`);
    this.dataFilterWorkCalendar.listStatus = this.listStatusChoose;
    this.frmGroup.get('listStatus').setValue(this.dataFilterWorkCalendar?.listStatus);
    await this.callDataSource();
  }

  async changeStatusLeave(event: any) {
    window.localStorage.setItem('attendanceReportLeaveStatus', `${this.listStatusLeaveChoose}`);
    this.dataFilterWorkCalendar.listStatusLeave = this.listStatusLeaveChoose;
    this.frmGroup.get('listStatusLeave').setValue(this.dataFilterWorkCalendar?.listStatusLeave);
    await this.callDataSource();
  }

  async changeStatusRole(event: any) {
    window.localStorage.setItem('attendanceReportRoleStatus', `${this.listStatusRoleChoose}`);
    this.dataFilterWorkCalendar.listRoles = this.listStatusRoleChoose;
    this.frmGroup.get('listRoles').setValue(this.dataFilterWorkCalendar?.listRoles);
    await this.callDataSource();
  }

  openEmployeeDetail(userId: string) {
    if (userId) {
      // Helper.pushBackURL();
      const urlDetail = `/configuration/${'employee'}/${userId}`;
      this.router.navigate([urlDetail]);
    }
  }

  async onRefresh() {
    await this.changeAttendanceReportMode();
  }

  async changeViewMode() {
    this.dataFilterWorkCalendar.viewMode = this.viewMode;
    await this.changeAttendanceReportMode();
  }

  async editWorkType(value, data) {
    if (value && data) {
      const model = data;
      model.workingType = value.value;
      var resp = await this.workCalendarService.saveWorkCalendar(model).toPromise();
      if (resp.result) {
        this.toast.success(`Save leave request successfully`, 'Success');
        await this.callDataSource();
      }
    }
  }

  async editWorkHour(value, data) {
    if (value && data) {
      if (value && data) {
        const model = data;
        model.workingHour = value.value;
        var resp = await this.workCalendarService.saveWorkCalendar(model).toPromise();
        if (resp.result) {
          this.toast.success(`Save leave request successfully`, 'Success');
          await this.callDataSource();
        }
      }
    }
  }
}