import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { LeaveRequestModel } from '../leave-request-management.model';
import { FormGroup } from '@angular/forms';
import { ConfirmModalComponent } from 'src/app/modules/shared/components/confirm-modal/confirm-modal.component';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { DataStateModel } from '../../datastate-management/data-state.model';
import { LeaveEntitlementModel } from '../../leave-entitlement-managament/leave-entitlement-management.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbToastrService } from '@nebular/theme';
import { DatastateService } from '../../datastate-management/datastate.service';
import { LeaveRequestManagementService } from '../leave-request-management.service';
import { LeaveEntitlementManagamentService } from '../../leave-entitlement-managament/leave-entitlement-management.service';
import { DatePipe } from '@angular/common';
import { NbAccessChecker } from '@nebular/security';
import { LeaveRequestStatus } from 'src/app/modules/shared/enum/leave-request-status.enum';
import { SettingModel } from '../../setting-management/setting-management.model';
import { SettingManagementService } from '../../setting-management/setting-management.service';

@Component({
  selector: 'app-add-edit-leave-request',
  templateUrl: './add-edit-leave-request.component.html',
  styleUrls: ['./add-edit-leave-request.component.scss']
})
export class AddEditLeaveRequestComponent implements OnInit, OnDestroy, AfterViewInit {

  private destroy$: Subject<void> = new Subject<void>();
  currentUser;
  isAdmin: boolean = false;
  isMyLeaveRequest: boolean = false;
  action: TblActionType;
  leaveRequestModel: LeaveRequestModel;
  frmLeaveRequest: FormGroup;
  isLoading = false;
  listSessions: string[] = ['Entire day', 'Morning', 'Afternoon'];
  employeeChosen: EmployeeModel;
  listEmployees: EmployeeModel[];
  listStatus: DataStateModel[] = [];
  statusDefault: number;
  sessionDefault = 'Entire day';
  isChange: boolean = false;
  employeeListLeaveEntitlement: LeaveEntitlementModel[] = [];
  leaveEntitlementChoosen: LeaveEntitlementModel;
  leaveEntitlementDefault: LeaveEntitlementModel;
  hasEditPermission: boolean = false;

  minDate: Date = new Date();
  defaultStartTime: Date = new Date();
  defaultEndTime: Date = new Date();

  lstWorkingTimeSettings: SettingModel[] = [];

  constructor(
    public dialModalRef: MatDialogRef<AddEditLeaveRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private employeeService: EmployeeManagementService,
    private frmBuilder: RxFormBuilder,
    private authService: NbAuthService,
    private toast: NbToastrService,
    private cdref: ChangeDetectorRef,
    private dialog: MatDialog,
    public dataStateService: DatastateService,
    private leaveRequestService: LeaveRequestManagementService,
    private leaveEntitlementService: LeaveEntitlementManagamentService,
    private datePipe: DatePipe,
    private permissionService: NbAccessChecker,
    private settingService: SettingManagementService,
  ) {
    this.action = data?.action ?? TblActionType.Add;
    this.leaveRequestModel = data?.model ?? new LeaveRequestModel();
    this.listEmployees = data?.listEmployees ?? [];
    this.authService.onTokenChange()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.currentUser = token.getPayload()?.user;
          if (this.currentUser?.roles[0]?.roleName === 'admin') this.isAdmin = true;
          if (!this.isAdmin) 
            this.listEmployees = this.listEmployees.filter(item => item.userId === this.currentUser?.userId || item.ownerId === this.currentUser?.userId);
        }
      });
    // this.permissionService.isGranted('view', 'accept-leave-request').subscribe(e => this.hasEditPermission = e);
    this.dataStateService.getDataStateByType('LEAVE_REQUEST').pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp.result) {
        this.listStatus = resp.result;
      }
    });

    this.settingService.getSettingByGroup('WORKING_TIME').pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp.result) {
        this.lstWorkingTimeSettings = resp.result;
      }
    });
  }
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  async ngOnInit() {
    this.frmLeaveRequest = this.frmBuilder.formGroup(LeaveRequestModel, this.leaveRequestModel);
    this.dialModalRef.updatePosition({ right: '0', });
    if (this.listEmployees?.length <= 0) {
      var respListEmployee = await this.employeeService.getAllEmployee().pipe(takeUntil(this.destroy$)).toPromise();
      if (respListEmployee.result) {
        this.listEmployees = respListEmployee.result;
        this.listEmployees.map((employee) => {
          let fullName = `${employee.firstName} ${employee.middleName} ${employee.lastName}`;
          employee.displayName = fullName.trim() ? fullName : "Unknown";
        });
        if (!this.isAdmin) 
          this.listEmployees = this.listEmployees.filter(item => item.userId === this.currentUser?.userId || item.ownerId === this.currentUser?.userId);
      }
    }
    this.frmLeaveRequest.get('status').disable();
    this.frmLeaveRequest.get('numberOfHour').disable();
    if (this.action === TblActionType.Add) {
      this.defaultStartTime.setHours(8, 30, 0);
      this.defaultEndTime.setHours(17, 30, 0);
      this.statusDefault = LeaveRequestStatus.WAITING;
      this.employeeService.getEmployeeById(this.currentUser?.userId).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.result) {
          this.getAssignee(res.result);
        }
      });
    }
    if (this.action === TblActionType.Edit) {
      this.statusDefault = this.leaveRequestModel?.status;
      this.defaultStartTime = new Date(this.leaveRequestModel?.leaveDateFrom);
      this.defaultEndTime = new Date(this.leaveRequestModel?.leaveDateTo);
      if (this.leaveRequestModel?.User) {
        this.getAssignee(this.leaveRequestModel?.User);
      }
      else {
        this.employeeService.getEmployeeById(this.leaveRequestModel?.userId).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.result) {
            this.employeeChosen = res.result;
          }
        });
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.frmLeaveRequest)
      this.frmLeaveRequest.valueChanges.pipe(take(1))
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

    this.dialModalRef.close();
  }


  saveData() {
    if (this.frmLeaveRequest.valid) {
      this.isLoading = !this.isLoading;
      const model: LeaveRequestModel = Object.assign({}, this.frmLeaveRequest.value);
      model.userId = this.employeeChosen?.userId;
      model.leaveRequestId = model.leaveRequestId ? model.leaveRequestId : 0;
      this.leaveRequestService.saveLeaveRequest(model).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp.result) {
          this.toast.success(`Save leave request successfully`, 'Success');
          this.dialModalRef.close(resp.result);
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
      });
    }
  }

  clearAssignee() {
    this.employeeChosen = null;
  }

  onChangeEmployee(e: any) {
    if(e) {
      this.frmLeaveRequest.get('userId').setValue(e.value);
      var currentEmpIndex = this.listEmployees.findIndex(x => x.userId === e.value);
      if(currentEmpIndex != -1 ) this.employeeChosen = this.listEmployees[currentEmpIndex];
      this.getAssignee(this.employeeChosen, true);
    }
  }

  getAssignee(data: EmployeeModel, forceToCheck: boolean = false) {
    if (data && (data !== this.employeeChosen || forceToCheck)) {
      this.employeeChosen = data;
      this.leaveEntitlementService.getLeaveEntitlementByEmployeeId(this.employeeChosen?.userId).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp.result) {
          this.employeeListLeaveEntitlement = resp.result;
          this.employeeListLeaveEntitlement = this.employeeListLeaveEntitlement.sort((a, b) => Number(b?.LeaveType?.isPaidSalary) - Number(a?.LeaveType?.isPaidSalary));
          this.employeeListLeaveEntitlement.map(item => {
            if ((item.usableLeave - item.usedLeave) <= 0) item['disabled'] = true;
            else item['disabled'] = false;
          })
        }
      }).add(() => {
        if (this.action === TblActionType.Add) {
          this.leaveEntitlementChoosen = this.employeeListLeaveEntitlement?.find(item => (item.usableLeave - item.usedLeave) > 0);
        }
        if (this.action === TblActionType.Edit) {
          this.leaveEntitlementChoosen = this.employeeListLeaveEntitlement.find(x => x.leaveEntitlementId === this.leaveRequestModel?.leaveEntitlementId);
        }
      });
    }
  }

  selectionLeaveEntitlement(e) {
    if (e && this.employeeListLeaveEntitlement) {
      this.leaveEntitlementChoosen = this.employeeListLeaveEntitlement.find(x => x.leaveEntitlementId === e.value);
    }
  }

  selectionSession(e) {
    if (e) {
      this.defaultStartTime = new Date();
      this.defaultEndTime = new Date();
      var morningStart = this.lstWorkingTimeSettings?.find(item => item.key === 'MORNING_START')?.value?.split(':');
      var morningEnd = this.lstWorkingTimeSettings?.find(item => item.key === 'MORNING_END')?.value?.split(':');
      var afternoonStart = this.lstWorkingTimeSettings?.find(item => item.key === 'AFTERNOON_START')?.value?.split(':');
      var afternoonEnd = this.lstWorkingTimeSettings?.find(item => item.key === 'AFTERNOON_END')?.value?.split(':');

      switch (e.value) {
        case 'Entire day':
          this.defaultStartTime.setHours(Number(morningStart[0]) ?? 8, Number(morningStart[1]) ?? 30, 0);
          this.defaultEndTime.setHours(Number(afternoonEnd[0]) ?? 17, Number(afternoonEnd[1]) ?? 30, 0);
          break;
        case 'Morning':
          this.defaultStartTime.setHours(Number(morningStart[0]) ?? 8, Number(morningStart[1]) ?? 30, 0);
          this.defaultEndTime.setHours(Number(morningEnd[0]) ?? 12, Number(morningEnd[1]) ?? 0, 0);
          break;
        case 'Afternoon':
          this.defaultStartTime.setHours(Number(afternoonStart[0]) ?? 13, Number(afternoonStart[1]) ?? 0, 0);
          this.defaultEndTime.setHours(Number(afternoonEnd[0]) ?? 17, Number(afternoonEnd[1]) ?? 30, 0);
          break;
      }
    }
  }

  handleDisplayStatus(state: number, isDisplayColor: boolean = false): string {
    if (this.listStatus?.length <= 0) {
      return isDisplayColor ? '#0000' : '';
    }

    if (isDisplayColor) {
      var findColor = this.listStatus.find(x => x.dataStateId === state);
      if (findColor) return findColor.colorCode;
      else return '#0000';
    }
    else {
      var findName = this.listStatus.find(x => x.dataStateId === state);
      if (findName) return findName.dataStateName;
      else return '';
    }
  }

  saveStatusInline(statusChange, row) {
    if (statusChange && row) {
      row.status = statusChange;
      this.leaveRequestService.saveLeaveRequest(row).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp.result) {
          this.toast.success(`Change status successfully`, 'Success');
          this.dialModalRef.close(resp.result);
        }
      });
    }
  }

  autoCalculateWorkingHour(startDate: Date | string, endDate: Date | string) {
    let numberOfHour: number = 0;
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    if (startDate && endDate) {
      const diffHour = Math.abs(startDate.getTime() - endDate.getTime()) / 36e5;
      if (this.datePipe.transform(startDate, 'longDate') == this.datePipe.transform(endDate, 'longDate')) //In a day case
      {
        if (diffHour >= 5.5) {
          numberOfHour = diffHour - 1.5;
          if (numberOfHour > 8) numberOfHour = 8;
        }
        else {
          numberOfHour = 3;
        }
      }
      else {
        const dayOfWorking = (diffHour / 24) | 0; //get mainly working time
        if (dayOfWorking < 1) numberOfHour = 8;
        else {
          numberOfHour = dayOfWorking * 8;
          let workHour = diffHour - dayOfWorking * 24;
          if (workHour > 9) {
            workHour -= 9;
            if (workHour >= 5.5) {
              workHour = workHour - 1.5;
              if (workHour > 8) workHour = 8;
            }
            else {
              workHour = 3;
            }
            numberOfHour += workHour;
          }
        }
      }
    }
    return numberOfHour;
  }
}
