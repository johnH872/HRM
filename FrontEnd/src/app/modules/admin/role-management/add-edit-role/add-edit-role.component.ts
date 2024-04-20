import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { MessageService } from 'primeng/api';
import { Subject, take, takeUntil } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/modules/shared/components/confirm-modal/confirm-modal.component';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { RoleModel } from 'src/app/modules/shared/models/role-model';
import { RoleManagementService } from 'src/app/modules/shared/services/role-management.service';

@Component({
  selector: 'app-add-edit-role',
  templateUrl: './add-edit-role.component.html',
  styleUrls: ['./add-edit-role.component.scss']
})
export class AddEditRoleComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$: Subject<void> = new Subject<void>();
  action: TblActionType;
  roleModel: RoleModel;
  form: FormGroup;
  isLoading = false;
  isChange: boolean = false;

  constructor(
    public dialModalRef: MatDialogRef<AddEditRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private roleService: RoleManagementService,
    private frmBuilder: RxFormBuilder,
    private dialog: MatDialog,
    private messageService: MessageService
  ) {
    if (data.action) this.action = data.action;
    else this.action = TblActionType.Add;
    this.roleModel = data?.model || new RoleModel();
  }

  ngOnInit(): void {
    this.form = this.frmBuilder.formGroup(RoleModel, this.roleModel);
    this.dialModalRef.updatePosition({ right: '0', });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    if (this.form)
      this.form.valueChanges.pipe(take(1))
        .subscribe(resp => this.isChange = true);
  }

  saveData() {
    if (this.form.valid) {
      this.isLoading = !this.isLoading;
      const model: RoleModel = Object.assign({}, this.form.value);
      model.isShow = true;
      this.roleService.saveRole(model).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp.result) {
          this.messageService.add({
            key: 'toast1', severity: 'success', summary: 'Success',
            detail: `Save role successfully!`, life: 2000
          });
          this.dialModalRef.close(resp.result);
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
      });
    }
  }

  closeDialog() {
    if (this.isChange) {
      this.isChange = false;
      const dialogRef = this.dialog.open(ConfirmModalComponent, {
        backdropClass: 'custom-backdrop',
        hasBackdrop: true,
        data: {
          message: "Do you wish to close this popup? You will lose your unsaved data."
        }
      });

      dialogRef.afterClosed().subscribe(response => {
        if (response) this.dialModalRef.close();
        else this.isChange = true;
      });
      return;
    }
    this.dialModalRef.close(false);
  }


}
