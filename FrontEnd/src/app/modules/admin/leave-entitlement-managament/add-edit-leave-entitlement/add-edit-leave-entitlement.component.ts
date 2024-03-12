import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { LeaveEntitlementModel } from '../leave-entitlement-management.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../../work-management/add-edit-work/add-edit-work.component';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { LeaveTypeModel } from '../../leave-type-management/leave-type-management.model';
import { environment } from 'src/enviroments/enviroment';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { NbToastrService } from '@nebular/theme';
import { LeaveEntitlementManagamentService } from '../leave-entitlement-management.service';
import { LeaveTypeManagementService } from '../../leave-type-management/leave-type-management.service';
import { ConfirmModalComponent } from 'src/app/modules/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-add-edit-leave-entitlement',
  templateUrl: './add-edit-leave-entitlement.component.html',
  styleUrls: ['./add-edit-leave-entitlement.component.scss']
})
export class AddEditLeaveEntitlementComponent implements OnInit, OnDestroy, AfterViewInit {

  private destroy$: Subject<void> = new Subject<void>();
  id: string;
  isMyLeaveEntitlement: boolean = false;
  action: TblActionType;
  leaveEntitlementModel: LeaveEntitlementModel;
  frmLeaveEntitlement: FormGroup;
  isLoading = false;
  isLoadingLeaveType = false;
  matcher = new MyErrorStateMatcher();
  employeeChosen: EmployeeModel;
  isAssignee: boolean = false;
  isChange: boolean = false;
  listEmployees: EmployeeModel[];
  listLeaveTypes: LeaveTypeModel[];
  environment = environment;
  leaveTypeChosen: LeaveTypeModel;
  readonly: boolean = false;
  seniorityLeaveBudget = {};
  seniorityLeaveTypeId: number;
  annuallyLeaveTypeId: number;
  transferLeaveTypeId: number;
  employeeStartContractInfo: string;
  frmDateRange = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required])
  });
  employeeListLeaveEntitlement: LeaveEntitlementModel[] = [];

  constructor(
    public dialModalRef: MatDialogRef<AddEditLeaveEntitlementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private employeeService: EmployeeManagementService,
    private frmBuilder: RxFormBuilder,
    private toast: NbToastrService,
    private cdref: ChangeDetectorRef,
    private dialog: MatDialog,
    private leaveEntitlementService: LeaveEntitlementManagamentService,
    private leaveTypeService: LeaveTypeManagementService,
  ) {
    if (data.model) {
      this.id = data.model.id;
    }
    this.id = data.id ?? this.id;
    this.action = data.action;
    this.leaveEntitlementModel = data.model ?? new LeaveEntitlementModel();
    this.listEmployees = data?.listEmployees ?? this.listEmployees;
    this.leaveTypeChosen = new LeaveTypeModel();

    if (this.action == TblActionType.Add) {
      
    }

    if (this.action == TblActionType.Edit) {
      this.employeeService.getEmployeeById(this.leaveEntitlementModel?.employee?.userId).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.result) {
          this.employeeChosen = res.result;
          this.isAssignee = true;
        }
      });
      this.setDefaultRangeDate();
    }
  }
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  async ngOnInit() {
    this.frmLeaveEntitlement = this.frmBuilder.formGroup(LeaveEntitlementModel, this.leaveEntitlementModel);
    this.dialModalRef.updatePosition({ right: '0', });
    if (this.listEmployees?.length <= 0) {
      var respListEmployee = await this.employeeService.getAllEmployee().pipe(takeUntil(this.destroy$)).toPromise();
      if (respListEmployee.result) {
        this.listEmployees = respListEmployee.result;
        this.listEmployees.map((employee) => {
          let fullName = `${employee.firstName} ${employee.middleName} ${employee.lastName}`;
          employee.displayName = fullName.trim() ? fullName : "Unknown";
        });
      }
    }
    this.isLoadingLeaveType = !this.isLoadingLeaveType;
    this.leaveTypeService.getAllLeaveType().pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.result) {
        this.listLeaveTypes = res.result;
      }
      this.isLoadingLeaveType = !this.isLoadingLeaveType;
    });

    if (this.leaveEntitlementModel?.leaveTypeId) {
      this.leaveTypeChosen = this.listLeaveTypes?.find(leaveType => leaveType.leaveTypeId === this.leaveEntitlementModel.leaveTypeId);
    }
    this.frmLeaveEntitlement.get('effectedYear').setValue(new Date().getFullYear());
    this.frmLeaveEntitlement.get('leaveTypeId').valueChanges.subscribe(valueChange => {
      this.isLoadingLeaveType = !this.isLoadingLeaveType;
      this.leaveTypeChosen = this.listLeaveTypes.find(leaveType => leaveType.leaveTypeId === valueChange);
      this.setDefaultRangeDate(this.frmLeaveEntitlement?.get('effectedYear')?.value);
      if (valueChange === this.seniorityLeaveTypeId) {
        this.frmLeaveEntitlement.get('availableLeave').setValue(this.leaveTypeChosen.defaultBudget);
        this.customUsableAvailableLeave();
      } else {
        this.frmLeaveEntitlement.get('usableLeave').setValue(null);
        this.frmLeaveEntitlement.get('availableLeave').setValue(null);
      }
      this.isLoadingLeaveType = !this.isLoadingLeaveType;
    });

    this.frmDateRange.get('endDate').valueChanges.subscribe(valueChange => {
      if (this.leaveTypeChosen?.leaveTypeId === this.seniorityLeaveTypeId && this.action === TblActionType.Add) {
        this.customUsableAvailableLeave();
      }
    });
  }

  customUsableAvailableLeave() {
    switch (this.leaveTypeChosen?.leaveTypeId) {
      case this.seniorityLeaveTypeId:
        var toDay = new Date();
        var dayStartContract = toDay;
        if (this.employeeChosen?.dateStartContract) {
          dayStartContract = new Date(this.employeeChosen?.dateStartContract);
        }
        if (!this.frmDateRange?.value?.startDate) {
          this.employeeStartContractInfo = "Please choose Start Date - End Date";
          return;
        }
        var dayCaculation = new Date(this.frmDateRange?.value?.startDate);
        var totalSeniority = caculation_distance_day(dayStartContract, dayCaculation) / 365;
        if (totalSeniority < 0) totalSeniority = 0;
        if (totalSeniority < 3) {
          this.frmLeaveEntitlement.get('usableLeave').setValue(0);
          this.frmLeaveEntitlement.get('availableLeave').setValue(0);
        } else if (totalSeniority >= 3 && totalSeniority < 5) {
          this.frmLeaveEntitlement.get('usableLeave').setValue(this.seniorityLeaveBudget[3]);
          this.frmLeaveEntitlement.get('availableLeave').setValue(this.seniorityLeaveBudget[3]);
        } else if (totalSeniority > 5) {
          this.frmLeaveEntitlement.get('usableLeave').setValue(this.seniorityLeaveBudget[5]);
          this.frmLeaveEntitlement.get('availableLeave').setValue(this.seniorityLeaveBudget[5]);
        }
        this.employeeStartContractInfo = "";
        break;
    }
  };

  ngAfterViewInit(): void {
    if (this.frmLeaveEntitlement)
      this.frmLeaveEntitlement.valueChanges.pipe(take(1))
        .subscribe(resp => this.isChange = true);
  }
  closeDialog() {
    if (this.isChange) {
      this.isChange = false;
      const dialogRef = this.dialog.open(ConfirmModalComponent, {
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
    if (this.leaveTypeChosen?.leaveTypeId === this.annuallyLeaveTypeId && this.readonly) this.dialModalRef.close(this.leaveEntitlementModel);
    else this.dialModalRef.close();
  }

  saveData() {
    if (this.frmLeaveEntitlement.valid) {
      this.isLoading = !this.isLoading;
      const model: LeaveEntitlementModel = Object.assign({}, this.frmLeaveEntitlement.value);
      model.userId = this.employeeChosen?.userId;
      if (this.frmDateRange?.valid) {
        model.startDate = this.frmDateRange?.value?.startDate;
        model.endDate = this.frmDateRange?.value?.endDate;
      }
      model.usedLeave = model.usedLeave ? model.usedLeave : 0;
      this.leaveEntitlementService.saveLeaveEntitlement(model).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp.result) {
          if (resp.result.leaveTypeId === this.annuallyLeaveTypeId) {
            this.toast.success(`Save leave request successfully`, 'Success');
            this.leaveEntitlementModel = resp.result;
            this.frmLeaveEntitlement.get('availableLeave').setValue(resp.result.availableLeave);
            this.frmLeaveEntitlement.get('usableLeave').setValue(resp.result.usableLeave);
            this.readonly = true;
            this.isChange = false;
          } else {
            this.toast.success(`Save leave request successfully`, 'Success');
            this.dialModalRef.close(resp.result);
          }
        } else {
          this.toast.danger(resp.message, 'Error');
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
      });
    }
  }

  choosenEmployee(user: EmployeeModel) {
    if (user && user !== this.employeeChosen) {
      this.employeeChosen = user;
      this.employeeService.getEmployeeById(this.employeeChosen?.userId).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp.result) {
          this.employeeChosen = resp.result;
        }
      }).add(() => {
        if (this.leaveTypeChosen?.leaveTypeId === this.seniorityLeaveTypeId) {
          this.customUsableAvailableLeave();
        }
      });
      this.isAssignee = true;
    } else {
      // this.employeeChosen = null;
      this.isAssignee = false;
    }
  }

  setDefaultRangeDate(value: any = null) {
    let today = new Date();
    var yearTransfer = value ? Number(value) : today.getFullYear();
    var startDate = new Date(yearTransfer, this.leaveTypeChosen?.defaultStartMonth - 1, this.leaveTypeChosen?.defaultStartDay);
    var endDate = new Date(yearTransfer + 1, this.leaveTypeChosen?.defaultEndMonth - 1, this.leaveTypeChosen?.defaultEndDay);
    if (this.leaveTypeChosen.leaveTypeId === this.transferLeaveTypeId || !this.leaveTypeChosen.isPaidSalary ||
        (this.leaveTypeChosen.defaultEndDay === 31 && this.leaveTypeChosen.defaultEndMonth === 12)) {
      endDate = new Date(yearTransfer, this.leaveTypeChosen?.defaultEndMonth - 1, this.leaveTypeChosen?.defaultEndDay);
    }
    if (this.leaveEntitlementModel && this.action === TblActionType.Edit) {
      startDate = new Date(this.leaveEntitlementModel?.startDate);
      endDate = new Date(this.leaveEntitlementModel?.endDate);
    }
    this.frmDateRange.setValue({ startDate: startDate.toDateString(), endDate: endDate.toDateString() });
  }

  clearDate(event) {
    event.stopPropagation();
    this.frmDateRange.reset({ startDate: '', endDate: '' });
  }
}

const caculation_distance_day = (d1, d2) => {
  let ms1 = d1.getTime();
  let ms2 = d2.getTime();
  return Math.ceil((ms2 - ms1) / (24*60*60*1000));
};