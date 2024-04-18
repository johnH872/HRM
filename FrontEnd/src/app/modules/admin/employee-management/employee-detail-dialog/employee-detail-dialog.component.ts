import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttendanceManagementService } from '../../attendance-managment/attendance-management.service';
import { MessageService } from 'primeng/api';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { LeaveEntitlementManagamentService } from '../../leave-entitlement-managament/leave-entitlement-management.service';
import { LeaveEntitlementModel } from '../../leave-entitlement-managament/leave-entitlement-management.model';
import { LeaveTypeManagementService } from '../../leave-type-management/leave-type-management.service';
import { LeaveTypeModel } from '../../leave-type-management/leave-type-management.model';
import { lastValueFrom } from 'rxjs';
import { LeaveType } from 'src/app/modules/shared/enum/leave-type.enum';

@Component({
  selector: 'app-employee-detail-dialog',
  templateUrl: './employee-detail-dialog.component.html',
  styleUrls: ['./employee-detail-dialog.component.scss']
})
export class EmployeeDetailDialogComponent implements OnInit, OnDestroy {
  employeeModel: EmployeeModel;
  leaveEntitlements: LeaveEntitlementModel[] = [];
  annualLeaveEntitlement: LeaveEntitlementModel;
  seniorityLeaveEntitlement: LeaveEntitlementModel;
  transferLeaveEntitlement: LeaveEntitlementModel;
  unpaidLeaveEntitlement: LeaveEntitlementModel;
  leaveTypes: LeaveTypeModel[] = [];
  usedAnnualLeavePercentage: number = null;
  usedSeniorityLeavePercentage: number = null;
  usedUnpaidLeavePercentage: number = null;
  usedTransferLeavePercentage: number = null;
  constructor(
    public dialModalRef: MatDialogRef<EmployeeDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private leaveEntitlementService: LeaveEntitlementManagamentService,
    private leaveTypeService: LeaveTypeManagementService,
    private messageService: MessageService,
    private frmBuilder: RxFormBuilder,
  ) {
    if (this.data.model) this.employeeModel = this.data.model;
  }

  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.leaveEntitlementService.getLeaveEntitlementByEmployeeId(this.employeeModel.userId).subscribe(res => {
      if (res.result && res.result.length > 0) {
        res.result.forEach(element => {
          switch (element.leaveTypeId) {
            case LeaveType.Annually:
              this.annualLeaveEntitlement = element;
              this.usedAnnualLeavePercentage = ((element.usableLeave - element.usedLeave) / element.usableLeave * 100);
              break;
            case LeaveType.Seniority:
              this.seniorityLeaveEntitlement = element;
              this.usedSeniorityLeavePercentage = ((element.usableLeave - element.usedLeave) / element.usableLeave * 100);
              break;
            case LeaveType.Transfer:
              this.transferLeaveEntitlement = element;
              this.usedTransferLeavePercentage = ((element.usableLeave - element.usedLeave) / element.usableLeave * 100);
              break;
            case LeaveType.UnPaid:
              this.unpaidLeaveEntitlement = element;
              this.usedUnpaidLeavePercentage = ((element.usableLeave - element.usedLeave) / element.usableLeave * 100);
              break;
          }
        });
      }
    })
  }

  ngOnDestroy(): void {

  }

  closeDialog() {
    this.dialModalRef.close(false);
  }
}
