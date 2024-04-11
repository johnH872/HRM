import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReportScheduleModel } from './report-schedule-management.model';
import { ReportScheduleDatum, ReportScheduleResult } from '../../shared/models/report-schedule.model';
import { FilterConfig } from '../../shared/components/dropdown-filter/filter-config';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { ReportScheduleManagementService } from './report-schedule-management.service';
import { EmployeeManagementService } from '../employee-management/employee-management.service';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
import { FilterType } from '../../shared/enum/filter-type.enum';
import { map } from 'rxjs';
import { MatOption } from '@angular/material/core';
import { Helper } from '../../shared/utility/Helper';

@Component({
  selector: 'app-report-schedule-management',
  templateUrl: './report-schedule-management.component.html',
  styleUrls: ['./report-schedule-management.component.scss']
})
export class ReportScheduleManagementComponent implements OnInit {
  @ViewChild('dataTable') table: ElementRef;
  @ViewChild('matSelectStatus') matSelectStatus: MatSelect;

  user;
  frmGroup: FormGroup;
  timeMode = 'Week';
  viewMode = 'Both';
  typeMode = 'List';
  timeModeDisplay = 'This week';
  isLoading = false;
  reportScheduleModel: ReportScheduleModel;
  data: ReportScheduleResult;
  dataSource : ReportScheduleDatum[] = [];
  headerData = [];
  headerData2 = [];
  footerData: ReportScheduleDatum;
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
  
  constructor(
    private frmBuilder: RxFormBuilder,
    private attendanceService: ReportScheduleManagementService,
    private userService: EmployeeManagementService,
    private authService: NbAuthService,
    private router: Router,
  ) { 
    this.reportScheduleModel = new ReportScheduleModel();
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
    this.frmGroup = this.frmBuilder.formGroup(ReportScheduleModel, this.reportScheduleModel);
  }

  async callDataSource() {
    this.isLoading = !this.isLoading;
    const result = await this.attendanceService.getReportSchedule(this.frmGroup.value).toPromise();
    if (result.result) {
      this.data = result.result;
      this.headerData = [];
      this.data.column.forEach(element => {
        this.headerData.push(...element.month)
      });
      this.headerData2 = [...this.defaultHeader, ...new Set(this.headerData.map(e => { return e.key })), ...['grandTotal']]; //Distinct a list to prevent duplicate column
      this.dataSource = [];
      this.setupData(this.data.data, this.dataSource);
      // this.footerData = {...this.dataSource[this.dataSource.length - 1]};
      // this.dataSource.pop();
    }
    this.isLoading = !this.isLoading;
  }

  setupData(input: ReportScheduleDatum[], output: ReportScheduleDatum[]) {
    for (var idx = 0; idx < input.length; idx++) {
      // input[idx] = {...input[idx], ...input[idx].attendanceModifiedMonthly}
      // input[idx] = {...input[idx], ...input[idx].leaveRequestMonthly}
      // input[idx] = {...input[idx], ...input[idx].leaveRequestTypeMonthly}
      // input[idx] = {...input[idx], ...input[idx].attendanceDetailMonthly}
      // input[idx] = {...input[idx], ...input[idx].attendanceRequestMonthly}
      // input[idx] = {...input[idx], ...input[idx].attendanceMonthly}
      input[idx].attendanceMonthly.map(item => input[idx] = {...input[idx], ...item});
      input[idx].attendanceDetailMonthly.map(item => input[idx] = {...input[idx], ...item});
      input[idx].leaveRequestMonthly.map(item => input[idx] = {...input[idx], ...item});
      input[idx].leaveRequestTypeMonthly.map(item => input[idx] = {...input[idx], ...item});

      output.push(...[input[idx]]);
    }
  }

  async changeAttendanceReportMode(changeMode: boolean = false) {
    const currentDate = new Date();
    this.reportScheduleModel.order = changeMode ? 0 : this.reportScheduleModel.order;
    switch (this.timeMode) {
      case "Week":
        this.timeModeDisplay = "This week";
        this.reportScheduleModel.fromDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
        this.reportScheduleModel.toDate = new Date(currentDate.setDate(currentDate.getDate() + (7 - currentDate.getDay())));
        this.reportScheduleModel.fromDate.setDate(this.reportScheduleModel.fromDate.getDate() + this.reportScheduleModel.order * 7);
        this.reportScheduleModel.toDate.setDate(this.reportScheduleModel.toDate.getDate() + this.reportScheduleModel.order * 7);
        break;
      case "Day":
        this.timeModeDisplay = "Today";
        this.reportScheduleModel.fromDate = new Date(currentDate);
        this.reportScheduleModel.toDate = new Date(currentDate);
        this.reportScheduleModel.fromDate.setDate(this.reportScheduleModel.fromDate.getDate() + this.reportScheduleModel.order);
        this.reportScheduleModel.toDate.setDate(this.reportScheduleModel.toDate.getDate() + this.reportScheduleModel.order);
        break;
      case "Month":
        this.timeModeDisplay = "This month";
        this.reportScheduleModel.fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + this.reportScheduleModel.order, 1);
        this.reportScheduleModel.toDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1 + this.reportScheduleModel.order, 0);
        break;
    }
    this.reportScheduleModel.fromDate.setHours(0, 0, 0);
    this.reportScheduleModel.toDate.setHours(23, 59, 59);
    this.reportScheduleModel.timeMode = this.timeMode;
    this.reportScheduleModel.listStatus = this.listStatusChoose;
    this.reportScheduleModel.listStatusLeave = this.listStatusLeaveChoose;
    this.reportScheduleModel.listRoles = this.listStatusRoleChoose;
    this.frmGroup = this.frmBuilder.formGroup(ReportScheduleModel, this.reportScheduleModel);
    await this.callDataSource();
  }

  async refreshData() {
    this.isMyEmployee = false;
    this.matSelectStatus?.options?.forEach((data: MatOption) => data.deselect());
    this.frmGroup.reset();
    this.listStatusChoose = [];
    this.listStatusLeaveChoose = [];
    this.listStatusRoleChoose = [];
    this.reportScheduleModel.order = 0;
    this.reportScheduleModel.listProfile = [];
    this.reportScheduleModel.listRoles = [];
    this.listStatus.map(item => this.listStatusChoose?.push(item?.value));
    window.localStorage.setItem('attendanceReportStatus', `${this.listStatusChoose}`);
    this.listStatusLeave.map(item => this.listStatusLeaveChoose?.push(item?.value));
    window.localStorage.setItem('attendanceReportLeaveStatus', `${this.listStatusLeaveChoose}`);
    // this.listStatusRole.map(item => this.listStatusRoleChoose?.push(item?.value));
    window.localStorage.setItem('attendanceReportRoleStatus', `${this.listStatusRoleChoose}`);
    this.reportScheduleModel.listStatus = this.listStatusChoose;
    this.reportScheduleModel.listStatusLeave = this.listStatusLeaveChoose;
    this.reportScheduleModel.listRoles = this.listStatusRoleChoose;
    await this.changeAttendanceReportMode();
  }

  async refreshThis() {
    this.reportScheduleModel.order = 0;
    await this.changeAttendanceReportMode();
  }

  async prevData() {
    this.reportScheduleModel.order -= 1;
    await this.changeAttendanceReportMode();
  }

  async nextData() {
    this.reportScheduleModel.order += 1;
    await this.changeAttendanceReportMode();
  }

  async applyFilter() {
    this.reportScheduleModel.order = 0;
    this.reportScheduleModel.fromDate = this.frmGroup?.get('fromDate')?.value;
    this.reportScheduleModel.toDate = this.frmGroup?.get('toDate')?.value;
    this.reportScheduleModel.listStatus = this.listStatusChoose;
    this.reportScheduleModel.listStatusLeave = this.listStatusLeaveChoose;
    this.frmGroup.get('listProfile').setValue(this.reportScheduleModel?.listProfile);
    this.frmGroup.get('listStatus').setValue(this.reportScheduleModel?.listStatus);
    this.frmGroup.get('listRoles').setValue(this.reportScheduleModel?.listRoles);
    this.frmGroup.get('listStatusLeave').setValue(this.reportScheduleModel?.listStatusLeave);
    await this.callDataSource();
  }

  async exportData(mode: boolean) {
    this.btnExportState = !this.btnExportState;
    // var model = new AttendanceReportExportModel();
    // this.frmGroup.get('listProfile').setValue(this.reportScheduleModel?.listProfile);
    // this.frmGroup.get('listRoles').setValue(this.reportScheduleModel?.listRoles);
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
    // model.dataFilter = this.reportScheduleModel;
    // var respExport = mode ? await this.attendanceService.exportDetailAttendanceReport(model).toPromise() : await this.attendanceService.exportAttendanceReport(model).toPromise();
    // if (respExport.result) {
    //   Helper.downloadFile(respExport.result);
    // }
    this.btnExportState = !this.btnExportState;
  }

  onFilterDropDownEmployee(event) {
    if (event) {
      this.reportScheduleModel.listProfile = event;
    }
  }

  onFilterDropDownRole(event) {
    if (event) {
      this.reportScheduleModel.listRoles = event;
      this.listStatusRoleChoose = [];
      this.reportScheduleModel?.listRoles?.map(role => {
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
        this.reportScheduleModel.listRoles = [];
        this.listStatusRoleChoose = [];
        this.reportScheduleModel.listProfile = [];
        this.reportScheduleModel.listProfile = this.reportScheduleModel?.listProfile?.concat(this.listOwners);
      }
    } else {
      this.reportScheduleModel.listProfile = this.reportScheduleModel?.listProfile?.filter(item => !this.listOwners.includes(item));
      this.listOwners = [];
    }
    this.frmGroup.get('listProfile').setValue(this.reportScheduleModel?.listProfile);
    this.frmGroup.get('listRoles').setValue(this.reportScheduleModel?.listRoles);
    await this.callDataSource();
  }

  async changeStatus(event: any) {
    window.localStorage.setItem('attendanceReportStatus', `${this.listStatusChoose}`);
    this.reportScheduleModel.listStatus = this.listStatusChoose;
    this.frmGroup.get('listStatus').setValue(this.reportScheduleModel?.listStatus);
    await this.callDataSource();
  }

  async changeStatusLeave(event: any) {
    window.localStorage.setItem('attendanceReportLeaveStatus', `${this.listStatusLeaveChoose}`);
    this.reportScheduleModel.listStatusLeave = this.listStatusLeaveChoose;
    this.frmGroup.get('listStatusLeave').setValue(this.reportScheduleModel?.listStatusLeave);
    await this.callDataSource();
  }

  async changeStatusRole(event: any) {
    window.localStorage.setItem('attendanceReportRoleStatus', `${this.listStatusRoleChoose}`);
    this.reportScheduleModel.listRoles = this.listStatusRoleChoose;
    this.frmGroup.get('listRoles').setValue(this.reportScheduleModel?.listRoles);
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
    this.reportScheduleModel.viewMode = this.viewMode;
    await this.changeAttendanceReportMode();
  }
}