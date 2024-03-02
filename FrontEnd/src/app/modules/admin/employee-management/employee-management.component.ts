import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmployeeManagementService } from './employee-management.service';
import { Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeModel } from '../../shared/models/employee.model';
import { AddEditEmployeeComponent } from './add-edit-employee/add-edit-employee.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: EmployeeModel[];
  employeeModel: EmployeeModel;

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedEmployees: EmployeeModel[] | null;

  constructor(
    private employeeService: EmployeeManagementService,
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
    var employeePagingResults = await this.employeeService.getEmployeePaging().pipe(takeUntil(this.destroy$)).toPromise();
    if (employeePagingResults.result) {
      this.dataTable = employeePagingResults.result;
      this.dataTable.map(data => {
        data.roleId = [];
        data?.Roles?.map(role => {
          data?.roleId?.push(role.roleId)
        })
      });
      this.dataTable.map(item => item.displayName = item.firstName + ' ' + item.middleName + ' ' + item.lastName)
    }
  }

  addEditEmployee(model: EmployeeModel = null) {
    this.employeeModel = model;
    const attendanceRef = this.dialog.open(AddEditEmployeeComponent, {
      disableClose: true,
      height: '100vh',
      width: '600px',
      autoFocus: false,
      data: {
        model: model,
        action: model === null ? TblActionType.Add : TblActionType.Edit,
      }
    });
    attendanceRef.afterClosed().subscribe(response => {
      if (response) {
        
      }
    });
  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
      this.first = this.first - this.rows;
  }

  reset() {
      this.first = 0;
  }

  pageChange(event) {
      this.first = event.first;
      this.rows = event.rows;
  }

  clear(table: Table) {
    table.clear();
  }

  onRowEditInit(employee: EmployeeModel) {
    
  }

  onRowEditSave(employee: EmployeeModel) {
    
  }

  onRowEditCancel(employee: EmployeeModel, index: number) {
    
  }

  saveEmployee() {

  }
}
