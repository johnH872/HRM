import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LeaveRequestModel } from './leave-request-management.model';
import { EmployeeModel } from '../../shared/models/employee.model';
import { LeaveRequestManagementService } from './leave-request-management.service';
import { EmployeeManagementService } from '../employee-management/employee-management.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditLeaveRequestComponent } from './add-edit-leave-request/add-edit-leave-request.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { Table } from 'primeng/table';
import { DatastateService } from '../datastate-management/datastate.service';
import { DataStateModel } from '../datastate-management/data-state.model';
import { NbGlobalLogicalPosition, NbToastrService } from '@nebular/theme';
import { DialogGetReasonRejectedComponent } from './dialog-get-reason-rejected/dialog-get-reason-rejected.component';
import { EmployeeDetailDialogComponent } from '../employee-management/employee-detail-dialog/employee-detail-dialog.component';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';

@Component({
  selector: 'app-leave-request-management',
  templateUrl: './leave-request-management.component.html',
  styleUrls: ['./leave-request-management.component.scss']
})
export class LeaveRequestManagementComponent implements OnInit, OnDestroy {
  user: any;
  isAdmin: boolean = false;

  @Input() isOnlyCurrentUser: boolean = false;
  @Input() currentUser: EmployeeModel = null;
  @Input() scrollHeight: String = '700px';
  @Input() isShowToolBar: boolean = true;
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: LeaveRequestModel[];
  leaveRequestModel: LeaveRequestModel;
  listEmployees: EmployeeModel[] = [];
  lstLeaveRequestState: DataStateModel[] = [];
  lstLeaveRequestStateEmployee: DataStateModel[] = [];

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedLeaveRequests: LeaveRequestModel[] | null;

  constructor(
    private leaveRequestService: LeaveRequestManagementService,
    private employeeService: EmployeeManagementService,
    private authService: NbAuthService,
    private dialog: MatDialog,
    private dataStateService: DatastateService,
    private toast: NbToastrService,
  ) {
    this.authService.onTokenChange()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.user = token.getPayload()?.user;
          if (this.user?.roles[0]?.roleName === 'admin') this.isAdmin = true;
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
    this.dataStateService.getDataStateByType("LEAVE_REQUEST").pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp.result) {
        this.lstLeaveRequestState = resp.result;
        this.lstLeaveRequestStateEmployee = this.lstLeaveRequestState.filter(item => item.dataStateName === 'WAITING' || item.dataStateName === 'CANCELED');
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
      if(this.isOnlyCurrentUser) this.dataTable = this.dataTable.filter(x => x.userId == this.currentUser.userId);
      if (!this.isAdmin) 
        this.dataTable = this.dataTable.filter(item => item.userId === this.user?.userId || item.User?.ownerId === this.user?.userId);
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

  deleteLeaveRequest(model: LeaveRequestModel) {

  }

  deleteSelectedRequest() {

  }

  handleDisplayStatus(state: number, isDisplayColor: boolean = false): string {
    if (this.lstLeaveRequestState?.length <= 0) {
      return isDisplayColor ? '#0000' : '';
    }

    if (isDisplayColor) {
      var findColor = this.lstLeaveRequestState?.find(x => x.dataStateId === state);
      if (findColor) return findColor?.colorCode;
      else return '#0000';
    }
    else {
      var findName = this.lstLeaveRequestState?.find(x => x.dataStateId === state);
      if (findName) return findName?.dataStateName;
      else return '';
    }
  }

  saveStatusInline(statusChange, row) {
    if (statusChange && row) {
      row.status = statusChange?.value;
      if (row.status === this.lstLeaveRequestState.find(item => item.dataStateName === 'REJECTED').dataStateId) {
        const dialogRef = this.dialog.open(DialogGetReasonRejectedComponent, {
          backdropClass: 'custom-backdrop',
          hasBackdrop: true,
        });

        dialogRef.afterClosed().subscribe(response => {
          if (response) {
            row.reasonRejected = response;
            this.leaveRequestService.saveLeaveRequest(row).pipe(takeUntil(this.destroy$)).subscribe(resp => {
              if (resp.result) {
                this.toast.success(`Change status successfully`, 'Success', {position: NbGlobalLogicalPosition.BOTTOM_END});
              }
            }).add(() => {
              this.refreshData();
            });
          } else {
            this.refreshData();
          }
        });
      } else {
        this.leaveRequestService.saveLeaveRequest(row).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp.result) {
            this.toast.success(`Change status successfully`, 'Success', {position: NbGlobalLogicalPosition.BOTTOM_END});
          }
        }).add(() => {
          this.refreshData();
        });
      }
    }
  }

  openEmployeeDetail(employee: EmployeeModel = null) {
    this.dialog.open(EmployeeDetailDialogComponent , {
      width: '90vw',
      height: '90vh',
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      data: {
        model: employee,
        action: TblActionType.Edit
      },
    }).afterClosed().subscribe(closeRes => {
      if (closeRes) {

      }
    });
  }
}