import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { LeaveEntitlementModel } from '../leave-entitlement-management.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { LeaveType } from 'src/app/modules/shared/enum/leave-type.enum';
import { DateFormatPipe } from 'src/app/modules/shared/pipes/date-time-format.pipe';

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
  // matcher = new MyErrorStateMatcher();
  employeeChosen: EmployeeModel;
  isAssignee: boolean = false;
  isChange: boolean = false;
  listEmployees: EmployeeModel[];
  listLeaveTypes: LeaveTypeModel[];
  environment = environment;
  leaveTypeChosen: LeaveTypeModel;
  readonly: boolean = false;
  employeeStartContractInfo: string;
  frmDateRange = new FormGroup({
    startDate: new FormControl(new Date(), [Validators.required]),
    endDate: new FormControl(new Date(), [Validators.required])
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
    private dateFormatPipe: DateFormatPipe,
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
      if (this.leaveEntitlementModel?.User) {
        this.employeeChosen = this.leaveEntitlementModel?.User;
      }
      else {
        this.employeeService.getEmployeeById(this.leaveEntitlementModel?.User?.userId).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.result) {
            this.employeeChosen = res.result;
            this.isAssignee = true;
          }
        });
      }
    }
    this.setDefaultRangeDate();
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
        this.listLeaveTypes = this.listLeaveTypes.filter(leaveType => leaveType.leaveTypeId !== LeaveType.Transfer);
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
      if (valueChange === LeaveType.Seniority) {
        this.frmLeaveEntitlement.get('availableLeave').setValue(this.leaveTypeChosen.defaultBudget);
        this.customUsableAvailableLeave();
      } else {
        this.frmLeaveEntitlement.get('usableLeave').setValue(null);
        this.frmLeaveEntitlement.get('availableLeave').setValue(null);
      }
      this.isLoadingLeaveType = !this.isLoadingLeaveType;
    });
  }

  customUsableAvailableLeave() {
    switch (this.leaveTypeChosen?.leaveTypeId) {
      case LeaveType.Seniority:
        var toDay = new Date();
        var dayStartContract = toDay;
        if (this.employeeChosen?.dateStartContract) {
          dayStartContract = new Date(this.employeeChosen?.dateStartContract);
        }

        var dayCaculation = new Date(this.frmDateRange?.value?.startDate);
        var totalSeniority = caculation_distance_day(dayStartContract, dayCaculation) / 365;
        if (totalSeniority < 0) totalSeniority = 0;
        if (totalSeniority < 3) {
          this.frmLeaveEntitlement.get('usableLeave').setValue(0);
          this.frmLeaveEntitlement.get('availableLeave').setValue(0);
        } else if (totalSeniority >= 3 && totalSeniority < 5) {
          this.frmLeaveEntitlement.get('usableLeave').setValue(3);
          this.frmLeaveEntitlement.get('availableLeave').setValue(3);
        } else if (totalSeniority >= 5) {
          this.frmLeaveEntitlement.get('usableLeave').setValue(3);
          this.frmLeaveEntitlement.get('availableLeave').setValue(3);
        }
        this.employeeStartContractInfo = "This employee has started contract at " + this.dateFormatPipe.transform(dayStartContract.toDateString()) + ".\n" + 
                                         "Up to " + this.dateFormatPipe.transform(dayCaculation.toDateString()) + 
                                         " employee has " + Math.floor(totalSeniority) + " years of seniority.";
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
    if (this.leaveTypeChosen?.leaveTypeId === LeaveType.Annually && this.readonly) this.dialModalRef.close(this.leaveEntitlementModel);
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
          if (resp.result.leaveTypeId === LeaveType.Annually) {
            this.toast.success(`Save leave entitlement successfully`, 'Success');
            this.leaveEntitlementModel = resp.result;
            this.frmLeaveEntitlement.get('availableLeave').setValue(resp.result.availableLeave);
            this.frmLeaveEntitlement.get('usableLeave').setValue(resp.result.usableLeave);
            this.readonly = true;
            this.isChange = false;
          } else {
            this.toast.success(`Save leave entitlement successfully`, 'Success');
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
        if (this.leaveTypeChosen?.leaveTypeId === LeaveType.Seniority) {
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
    var endDate = new Date(yearTransfer, this.leaveTypeChosen?.defaultEndMonth - 1, this.leaveTypeChosen?.defaultEndDay);
    if (this.leaveEntitlementModel && this.action === TblActionType.Edit) {
      startDate = new Date(this.leaveEntitlementModel?.startDate);
      endDate = new Date(this.leaveEntitlementModel?.endDate);
    }
    this.frmDateRange.setValue({ startDate: startDate, endDate: endDate });
  }

  clearDate(event) {
    event.stopPropagation();
    this.frmDateRange.reset({ startDate: null, endDate: null });
  }
}

const caculation_distance_day = (d1, d2) => {
  let ms1 = d1.getTime();
  let ms2 = d2.getTime();
  return Math.ceil((ms2 - ms1) / (24*60*60*1000));
};