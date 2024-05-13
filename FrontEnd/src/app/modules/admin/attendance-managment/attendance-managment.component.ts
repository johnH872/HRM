import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AttendanceModel } from './attendance.model';
import { MatDialog } from '@angular/material/dialog';
import { DatastateService } from '../datastate-management/datastate.service';
import { AttendanceManagementService } from './attendance-management.service';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { Table } from 'primeng/table';
import { AddEditAttendanceComponent } from './add-edit-attendance/add-edit-attendance.component';
import { EmployeeModel } from '../../shared/models/employee.model';
import { EmployeeManagementService } from '../employee-management/employee-management.service';

@Component({
  selector: 'app-attendance-managment',
  templateUrl: './attendance-managment.component.html',
  styleUrls: ['./attendance-managment.component.scss']
})
export class AttendanceManagmentComponent implements OnInit, OnDestroy {
  @Input() isOnlyCurrentUser: boolean = false;
  @Input() currentUser: EmployeeModel = null;
  @Input() scrollHeight: String = '700px';
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: AttendanceModel[];
  attendanceModel: AttendanceModel;
  listEmployees: EmployeeModel[] = [];

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedAttendances: AttendanceModel[] | null;

  constructor(
    private attendanceService: AttendanceManagementService,
    private employeeService: EmployeeManagementService,
    private dataStateService: DatastateService,
    private dialog: MatDialog,
  ) {
    this.employeeService.getAllEmployee().pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.result) {
        this.listEmployees = res.result;
        this.listEmployees.map((employee) => {
          let fullName = `${employee.firstName} ${employee.middleName} ${employee.lastName}`;
          employee.displayName = fullName.trim() ? fullName : "Unknown";
        });
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
    var attendancePagingResults = await this.attendanceService.getAllAttendance().pipe(takeUntil(this.destroy$)).toPromise();
    if (attendancePagingResults.result) {
      if(this.isOnlyCurrentUser) {
        attendancePagingResults.result = attendancePagingResults.result.filter(x => x.userId === this.currentUser.userId);
      }
      this.dataTable = attendancePagingResults.result;
    }
    this.loading = !this.loading;
  }

  async addEditAttendance(model: AttendanceModel = null) {
    this.attendanceModel = model;
    const attendanceRef = this.dialog.open(AddEditAttendanceComponent, {
      disableClose: true,
      height: '100vh',
      width: '600px',
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        model: model,
        listEmployees: this.listEmployees,
        action: model === null ? TblActionType.Add : TblActionType.Edit,
      }
    });
    attendanceRef.afterClosed().subscribe(async response => {
      if (response) {
        await this.refreshData();
      }
    });
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

  deleteAttendance(model: AttendanceModel) {

  }
  
  deleteSelectedAttendance() {

  }
}
