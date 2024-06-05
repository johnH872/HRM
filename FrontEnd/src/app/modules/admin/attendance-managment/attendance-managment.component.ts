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
import { EmployeeDetailDialogComponent } from '../employee-management/employee-detail-dialog/employee-detail-dialog.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { MessageService } from 'primeng/api';

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
    private messageService: MessageService
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
      if (this.isOnlyCurrentUser) {
        attendancePagingResults.result = attendancePagingResults.result.filter(x => x.userId === this.currentUser.userId);
      }
      this.dataTable = attendancePagingResults.result;
    }
    this.loading = !this.loading;
    this.selectedAttendances = [];
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

  deleteSelectedAttendance(attendanceModel: AttendanceModel = null) {
    var deleteIds = attendanceModel ? [attendanceModel.attendanceId] : this.selectedAttendances.map(x => x.attendanceId);
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
      this.attendanceService.deleteAttendance(deleteIds).subscribe(res => {
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

  openEmployeeDetail(employee: EmployeeModel = null) {
    if (!this.isOnlyCurrentUser) {
      this.dialog.open(EmployeeDetailDialogComponent, {
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
}
