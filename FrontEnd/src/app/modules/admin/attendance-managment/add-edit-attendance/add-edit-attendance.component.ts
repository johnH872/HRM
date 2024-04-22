import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { AttendanceModel } from '../attendance.model';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbToastrService } from '@nebular/theme';
import { NbAccessChecker } from '@nebular/security';
import { AttendanceManagementService } from '../attendance-management.service';
import { ConfirmModalComponent } from 'src/app/modules/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-add-edit-attendance',
  templateUrl: './add-edit-attendance.component.html',
  styleUrls: ['./add-edit-attendance.component.scss']
})
export class AddEditAttendanceComponent implements OnInit, OnDestroy, AfterViewInit {

  private destroy$: Subject<void> = new Subject<void>();
  currentUser;
  action: TblActionType;
  attendanceModel: AttendanceModel;
  frmAttendance: FormGroup;
  isLoading = false;
  employeeChosen: EmployeeModel;
  listEmployees: EmployeeModel[];
  isChange: boolean = false;
  hasEditPermission: boolean = false;
  defaultPunchinDate: Date;
  defaultPunchoutDate: Date;

  constructor(
    public dialModalRef: MatDialogRef<AddEditAttendanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private employeeService: EmployeeManagementService,
    private frmBuilder: RxFormBuilder,
    private authService: NbAuthService,
    private toast: NbToastrService,
    private cdref: ChangeDetectorRef,
    private dialog: MatDialog,
    private attendanceService: AttendanceManagementService,
    private permissionService: NbAccessChecker,
  ) {
    this.action = data?.action ?? TblActionType.Add;
    this.attendanceModel = data?.model ?? new AttendanceModel();
    this.listEmployees = data?.listEmployees ?? [];
    this.authService.onTokenChange()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.currentUser = token.getPayload();
        }
    });
    // this.permissionService.isGranted('view', 'accept-leave-request').subscribe(e => this.hasEditPermission = e);
  }
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  async ngOnInit() {
    this.frmAttendance = this.frmBuilder.formGroup(AttendanceModel, this.attendanceModel);
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
    if (this.action === TblActionType.Add) {
      this.defaultPunchinDate = new Date();
      this.defaultPunchoutDate = new Date();
      this.employeeService.getEmployeeById(this.currentUser?.nameid).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.result) {
          this.getAssignee(res.result);
        }
      });
    }
    if (this.action === TblActionType.Edit) {
      this.defaultPunchinDate = new Date(this.attendanceModel?.punchinDate);
      this.defaultPunchoutDate = new Date(this.attendanceModel?.punchoutDate);
      if (this.attendanceModel?.User) {
        this.getAssignee(this.attendanceModel?.User);
      }
      else {
        this.employeeService.getEmployeeById(this.attendanceModel?.userId).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.result) {
            this.employeeChosen = res.result;
          }
        });
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.frmAttendance)
      this.frmAttendance.valueChanges.pipe(take(1))
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
    if (this.frmAttendance.valid) {
      this.isLoading = !this.isLoading;
      const model: AttendanceModel = Object.assign({}, this.frmAttendance.value);
      model.userId = this.employeeChosen?.userId;
      model.attendanceId = model.attendanceId ? model.attendanceId : 0;
      this.attendanceService.saveAttendance(model).pipe(takeUntil(this.destroy$)).subscribe(resp => {
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

  getAssignee(data: EmployeeModel, forceToCheck: boolean = false) {
    if (data && (data !== this.employeeChosen || forceToCheck)) {
      this.employeeChosen = data;
    }
  }

  onChangeEmployee(e: any) {
    if(e) {
      this.frmAttendance.get('userId').setValue(e.value);
      var currentEmpIndex = this.listEmployees.findIndex(x => x.userId === e.value);
      if(currentEmpIndex != -1 ) this.employeeChosen = this.listEmployees[currentEmpIndex];
      this.getAssignee(this.employeeChosen, true);
    }
  }
}