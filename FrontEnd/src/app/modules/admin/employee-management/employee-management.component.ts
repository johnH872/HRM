import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmployeeManagementService } from './employee-management.service';
import { Subject, lastValueFrom, map, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeModel } from '../../shared/models/employee.model';
import { AddEditEmployeeComponent } from './add-edit-employee/add-edit-employee.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { TrainEmployeeComponent } from './train-employee/train-employee.component';
import { RoleModel } from '../../shared/models/role-model';
import { RoleManagementService } from '../../shared/services/role-management.service';
import { DatastateService } from '../datastate-management/datastate.service';
import { EmployeeDetailDialogComponent } from './employee-detail-dialog/employee-detail-dialog.component';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: EmployeeModel[];
  employeeModel: EmployeeModel;
  lstRoles: RoleModel[] = [];
  lstEmployees: EmployeeModel[] = [];
  lstNationalities: any[];
  currentUser: any;
  adminRole: RoleModel;
  isAdmin: boolean = false;

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedEmployees: EmployeeModel[] | null;

  constructor(
    private employeeService: EmployeeManagementService,
    private roleService: RoleManagementService,
    private dataStateService: DatastateService,
    private dialog: MatDialog,
    private authService: NbAuthService,
    private messageService: MessageService
  ) {
    this.authService.onTokenChange().pipe(takeUntil(this.destroy$)).subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.currentUser = token.getPayload().user;
      }
    });
    this.roleService.getRoles().subscribe(res => {
      if (res.result != null && res.result.length > 0) {
        this.lstRoles = [...res.result];
        this.adminRole = this.lstRoles.find(x => x.roleName.toLocaleLowerCase().trim() == 'admin');
        // Check admin role
        if(this.currentUser.roles.length > 0 && this.adminRole) this.isAdmin = this.currentUser.roles.findIndex(x => x.roleId === this.adminRole.roleId) != -1;
      }
    });
    this.dataStateService.getListCountries().subscribe(resp => {
      if (resp) {
        this.lstNationalities = resp.map(item => Object.assign({ text: `${item?.name?.common}`, value: item?.name?.common, img: item?.flags?.png }));
      } else this.lstNationalities = [];
    });
  }

  async ngOnInit() {
    this.loading = !this.loading;
    await this.refreshData();
    this.loadAllEmployeeData();
    this.loading = !this.loading;
  }

  async loadAllEmployeeData() {
    if (this.lstEmployees?.length <= 0) {
      var respListEmployee = await lastValueFrom(this.employeeService.getAllEmployee());
      if (respListEmployee.result) {
        this.lstEmployees = respListEmployee.result;
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async refreshData() {
    this.loading = !this.loading;
    var employeePagingResults = await this.employeeService.getEmployeeCurrentUserRole(this.currentUser.roles).pipe(takeUntil(this.destroy$)).toPromise();
    if (employeePagingResults.result) {
      this.dataTable = employeePagingResults.result;
      this.dataTable.map(data => {
        data.roleId = [];
        data?.Roles?.map(role => {
          data?.roleId?.push(role.roleId)
        })
      });
      this.dataTable.map(item => item.displayName =  `${item.firstName || ''}  ${item.middleName || ''}  ${item.lastName || ''}`)
    }
    this.loading = !this.loading;
  }

  async addEditEmployee(model: EmployeeModel = null) {
    this.employeeModel = model;
    const attendanceRef = this.dialog.open(AddEditEmployeeComponent, {
      disableClose: true,
      height: '100vh',
      width: '600px',
      autoFocus: false,
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      data: {
        model: model,
        action: model === null ? TblActionType.Add : TblActionType.Edit,
        listEmployees: [],
        isAdmin: this.isAdmin
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
  
  deleteSelectedEmployee() {

  }

  addEmployeeFaceRecog(model: EmployeeModel = null) {
    this.employeeModel = model;
    const attendanceRef = this.dialog.open(TrainEmployeeComponent, {
      disableClose: true,
      height: "calc(100% - 30px)",
      width: "80%",
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        model: model,
      }
    });
    attendanceRef.afterClosed().subscribe(async response => {
      if (response) {
        await this.refreshData();
      }
    });
  }

  getNationalityImg(value) {
    return this.lstNationalities?.find(item => item.value.toLowerCase() === value.toLowerCase())?.img;
  }

  openEmployeeDetail(employee: EmployeeModel = null) {
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
      if(closeRes) {

      }
    });
  }

  deleteEmployee(employee: EmployeeModel) {
    var deleteIds = [];
    if(employee) deleteIds = [employee.userId];
    else deleteIds = this.selectedEmployees.map(x => x.userId);
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
      if(!dialogRes) return;
      this.employeeService.deleteEmployees(deleteIds).subscribe(res => {
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
}
