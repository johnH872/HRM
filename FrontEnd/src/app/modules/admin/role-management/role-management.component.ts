import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { RoleModel } from '../../shared/models/role-model';
import { MatDialog } from '@angular/material/dialog';
import { RoleManagementService } from '../../shared/services/role-management.service';
import { Table } from 'primeng/table';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { MessageService } from 'primeng/api';
import { AddEditRoleComponent } from './add-edit-role/add-edit-role.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataTable: RoleModel[];
  roleModel: RoleModel;

  first = 0;
  rows = 10;
  loading: boolean = false;
  selectedRoles: RoleModel[] | null;
  constructor(
    private roleService: RoleManagementService,
    private dialog: MatDialog,
    private messageService: MessageService
  ) {

  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.roleService.getRoles().subscribe(res => {
      if (res.result) {
        this.dataTable = res.result;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  pageChange(event) {
    this.first = event.first;
    this.rows = event.rows;
  }

  clear(table: Table) {
    table.clear();
  }

  addEditRole(model: RoleModel) {
    this.roleModel = model;
    const attendanceRef = this.dialog.open(AddEditRoleComponent, {
      disableClose: true,
      height: '100vh',
      width: '600px',
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        model: model,
        action: !model ? TblActionType.Add : TblActionType.Edit,
      }
    });
    attendanceRef.afterClosed().subscribe(async response => {
      if (response) {
        this.refreshData();
      }
    });
  }

  deleteRole(roleModel: RoleModel) {
    var removeIds = [];
    if (!roleModel || this.selectedRoles.length <= 0) return;
    if (roleModel) removeIds = [roleModel.roleId];
    else removeIds = this.selectedRoles.map(x => x.roleId);

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: 'auto',
      height: 'auto',
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        message: `Do you wish to remove ${removeIds.length} item(s)?`
      }
    });
    dialogRef.afterClosed().subscribe(dialogRes => {
      this.roleService.deleteRoles(removeIds).subscribe(res => {
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
