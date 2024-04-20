import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LeaveTypeModel } from './leave-type-management.model';
import { LeaveTypeManagementService } from './leave-type-management.service';
import { MatDialog } from '@angular/material/dialog';
import { AddEditLeaveTypeComponent } from './add-edit-leave-type/add-edit-leave-type.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-leave-type-management',
  templateUrl: './leave-type-management.component.html',
  styleUrls: ['./leave-type-management.component.scss']
})
export class LeaveTypeManagementComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: LeaveTypeModel[];
  leaveTypeModel: LeaveTypeModel;

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedLeaveTypes: LeaveTypeModel[] | null;

  constructor(
    private leaveTypeService: LeaveTypeManagementService,
    private dialog: MatDialog,
  ) {

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
    var employeePagingResults = await this.leaveTypeService.getAllLeaveType().pipe(takeUntil(this.destroy$)).toPromise();
    if (employeePagingResults.result) {
      this.dataTable = employeePagingResults.result;
    }
    this.loading = !this.loading;
  }

  async addEditLeaveType(model: LeaveTypeModel = null) {
    this.leaveTypeModel = model;
    const attendanceRef = this.dialog.open(AddEditLeaveTypeComponent, {
      disableClose: true,
      height: '100vh',
      width: '600px',
      autoFocus: false,
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      data: {
        model: model,
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

  deleteLeaveType(model: LeaveTypeModel) {
    
  }

  deleteSelectedLeaveType() {

  }
}