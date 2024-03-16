import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LeaveRequestModel } from './leave-request-management.model';
import { EmployeeModel } from '../../shared/models/employee.model';
import { LeaveRequestManagementService } from './leave-request-management.service';
import { EmployeeManagementService } from '../employee-management/employee-management.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditLeaveRequestComponent } from './add-edit-leave-request/add-edit-leave-request.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-leave-request-management',
  templateUrl: './leave-request-management.component.html',
  styleUrls: ['./leave-request-management.component.scss']
})
export class LeaveRequestManagementComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: LeaveRequestModel[];
  leaveRequestModel: LeaveRequestModel;
  listEmployees: EmployeeModel[] = [];

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedLeaveRequests: LeaveRequestModel[] | null;

  constructor(
    private leaveRequestService: LeaveRequestManagementService,
    private employeeService: EmployeeManagementService,
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
    var leaveRequestPagingResults = await this.leaveRequestService.getAllLeaveRequest().pipe(takeUntil(this.destroy$)).toPromise();
    if (leaveRequestPagingResults.result) {
      this.dataTable = leaveRequestPagingResults.result;
    }
    this.loading = !this.loading;
  }

  async addEditLeaveRequest(model: LeaveRequestModel = null) {
    this.leaveRequestModel = model;
    const attendanceRef = this.dialog.open(AddEditLeaveRequestComponent, {
      disableClose: true,
      height: '100vh',
      width: '600px',
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

  deleteLeaveRequest(model: LeaveRequestModel) {
    
  }

  deleteSelectedRequest() {

  }
}