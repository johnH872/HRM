import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AttendanceModel } from './attendance.model';
import { MatDialog } from '@angular/material/dialog';
import { DatastateService } from '../datastate-management/datastate.service';
import { AttendanceManagementService } from './attendance-management.service';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { Table } from 'primeng/table';
import { AddEditAttendanceComponent } from './add-edit-attendance/add-edit-attendance.component';

@Component({
  selector: 'app-attendance-managment',
  templateUrl: './attendance-managment.component.html',
  styleUrls: ['./attendance-managment.component.scss']
})
export class AttendanceManagmentComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: AttendanceModel[];
  attendanceModel: AttendanceModel;

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedAttendances: AttendanceModel[] | null;

  constructor(
    private attendanceService: AttendanceManagementService,
    private dataStateService: DatastateService,
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
    var attendancePagingResults = await this.attendanceService.getAllAttendance().pipe(takeUntil(this.destroy$)).toPromise();
    if (attendancePagingResults.result) {
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
      autoFocus: false,
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

  deleteAttendance(model: AttendanceModel) {

  }
  
  deleteSelectedAttendance() {

  }
}
