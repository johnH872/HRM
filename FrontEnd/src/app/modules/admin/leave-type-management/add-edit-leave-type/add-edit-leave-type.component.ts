import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { LeaveTypeModel } from '../leave-type-management.model';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbGlobalLogicalPosition, NbToastrService } from '@nebular/theme';
import { LeaveTypeManagementService } from '../leave-type-management.service';
import { DatastateService } from '../../datastate-management/datastate.service';

@Component({
  selector: 'app-add-edit-leave-type',
  templateUrl: './add-edit-leave-type.component.html',
  styleUrls: ['./add-edit-leave-type.component.scss']
})
export class AddEditLeaveTypeComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  action: TblActionType;
  leaveTypeModel: LeaveTypeModel;
  frmLeaveType: FormGroup;
  isLoading = false;
  user;
  listDay: number[] = [];
  listMonth: number[] = [];

  constructor(
    public dialModalRef: MatDialogRef<AddEditLeaveTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private frmBuilder: RxFormBuilder,
    private authService: NbAuthService,
    private toast: NbToastrService,
    private cdref: ChangeDetectorRef,
    private leaveTypeService: LeaveTypeManagementService,
    private dataStateService: DatastateService,
  ) {
    this.action = data?.action;
    this.leaveTypeModel = data?.model ?? new LeaveTypeModel();
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.user = token.getPayload().user;
      }
    });
  }

  ngOnInit() {
    this.frmLeaveType = this.frmBuilder.formGroup(LeaveTypeModel, this.leaveTypeModel);
    this.dialModalRef.updatePosition({ right: '0', });
    for (var i = 1; i < 32; i++) {
      this.listDay.push(i);
    }
    for (var i = 1; i < 13; i++) {
      this.listMonth.push(i);
    }
    if (this.action == TblActionType.Add) {
      this.frmLeaveType.get('defaultStartDay').setValue(1);
      this.frmLeaveType.get('defaultStartMonth').setValue(1);
      this.frmLeaveType.get('defaultEndDay').setValue(31);
      this.frmLeaveType.get('defaultEndMonth').setValue(12);
    }
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeDialog() {
    this.dialModalRef.close();
  }

  saveData() {
    if (this.frmLeaveType?.valid) {
      this.isLoading = !this.isLoading;
      const model: LeaveTypeModel = Object.assign({}, this.frmLeaveType?.value);

      this.leaveTypeService.saveLeaveType(model).subscribe(resp => {
        if (resp.result) {
          this.toast.success(`Save leave type successfully`, 'Success', {position: NbGlobalLogicalPosition.BOTTOM_END});
          this.dialModalRef.close(resp.result);
        } else {
          this.toast.danger(resp.message, 'Failure', {position: NbGlobalLogicalPosition.BOTTOM_END});
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
      });
    }
  }
}