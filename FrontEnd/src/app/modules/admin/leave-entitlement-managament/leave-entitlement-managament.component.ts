import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LeaveEntitlementModel } from './leave-entitlement-management.model';
import { LeaveEntitlementManagamentService } from './leave-entitlement-management.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditLeaveEntitlementComponent } from './add-edit-leave-entitlement/add-edit-leave-entitlement.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { Table } from 'primeng/table';
import { EmployeeManagementService } from '../employee-management/employee-management.service';
import { EmployeeModel } from '../../shared/models/employee.model';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';

@Component({
  selector: 'app-leave-entitlement-managament',
  templateUrl: './leave-entitlement-managament.component.html',
  styleUrls: ['./leave-entitlement-managament.component.scss']
})
export class LeaveEntitlementManagamentComponent implements OnInit, OnDestroy {
  currentUser: any;
  isAdmin: boolean = false;
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: LeaveEntitlementModel[];
  leaveEntitlementModel: LeaveEntitlementModel;
  listEmployees: EmployeeModel[] = [];

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedLeaveEntitlements: LeaveEntitlementModel[] | null;

  constructor(
    private leaveEntitlementService: LeaveEntitlementManagamentService,
    private employeeService: EmployeeManagementService,
    private authService: NbAuthService,
    private dialog: MatDialog,
  ) {
    this.authService.onTokenChange()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.currentUser = token.getPayload()?.user;
          if (this.currentUser?.roles[0]?.roleName === 'admin') this.isAdmin = true;
        }
      });
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
    var leaveEntitlementPagingResults = await this.leaveEntitlementService.getAllLeaveEntitlement().pipe(takeUntil(this.destroy$)).toPromise();
    if (leaveEntitlementPagingResults.result) {
      this.dataTable = leaveEntitlementPagingResults.result;
    }
    this.loading = !this.loading;
  }

  async addEditLeaveEntitlement(model: LeaveEntitlementModel = null) {
    this.leaveEntitlementModel = model;
    const attendanceRef = this.dialog.open(AddEditLeaveEntitlementComponent, {
      disableClose: true,
      height: '100vh',
      width: '600px',
      autoFocus: false,
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
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

  deleteLeaveEntitlement(model: LeaveEntitlementModel) {
    
  }

  deleteSelectedEntitlement() {

  }
}