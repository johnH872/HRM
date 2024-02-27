import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbToastrService } from '@nebular/theme';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from 'src/app/@core/mock/users.service';
import { QuillConfiguration } from 'src/app/modules/shared/components/rich-inline-edit/rich-inline-edit.component';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { EmployeeManagementService } from '../employee-management.service';

@Component({
  selector: 'app-add-edit-employee',
  templateUrl: './add-edit-employee.component.html',
  styleUrls: ['./add-edit-employee.component.scss']
})
export class AddEditEmployeeComponent implements OnInit {

  private destroy$: Subject<void> = new Subject<void>();
  action: TblActionType;
  employeeModel: EmployeeModel;
  frmEmployee: FormGroup;
  isLoading = false;
  editorOptions = QuillConfiguration;
  user;

  constructor(
    public dialModalRef: MatDialogRef<AddEditEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private frmBuilder: RxFormBuilder,
    private authService: NbAuthService,
    private toast: NbToastrService,
    private cdref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private employeeService: EmployeeManagementService,
  ) {
    this.action = data?.action;
    this.employeeModel = data?.model ?? new EmployeeModel();
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.user = token.getPayload();
      }
    });
  }

  ngOnInit() {
    this.frmEmployee = this.frmBuilder.formGroup(EmployeeModel, this.employeeModel);
    this.dialModalRef.updatePosition({ right: '0', });
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
    // if (this.frmEmployee.valid) {
    //   this.isLoading = !this.isLoading;
    //   const model: EmployeeModel = Object.assign({}, this.frmEmployee.value);
    //   model.base64IMG = this.headShot.pictureHeadShot?.substring(this.headShot.pictureHeadShot?.lastIndexOf(',') + 1);
    //   model.pictureURL = this.userModel.pictureURL;
    //   if (this.action == 0) model.isActive = true;
    //   let isEmptyPassword = false;
    //   if (this.action == 0 && !model.password && !model.confirmPassword) {
    //     isEmptyPassword = true;
    //     model.password = Helper.makeid(6);
    //   }

    //   this.saleAccountService.saveEmployee(model).subscribe(resp => {
    //     if (resp.result) {
    //       this.toast.success(`Save user ${model.userName} successfully`, 'Success');

    //       if (this.action == 0 && isEmptyPassword) {
    //         this.userService.sendEmailResetPassword(resp.result.id).subscribe(emailResp => {
    //           if (emailResp.result) {
    //             this.toast.success(
    //               `Please check email ${resp.result.email} to reset password`,
    //               "Success")
    //           }
    //         })
    //       }

    //       this.dialModalRef.close(resp.result);
    //     }
    //   }).add(() => {
    //     this.isLoading = !this.isLoading;
    //   });
    // }
  }
}