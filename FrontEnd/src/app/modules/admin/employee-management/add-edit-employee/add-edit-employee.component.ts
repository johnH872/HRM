import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbToastrService } from '@nebular/theme';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { Subject, lastValueFrom, map, takeUntil } from 'rxjs';
import { QuillConfiguration } from 'src/app/modules/shared/components/rich-inline-edit/rich-inline-edit.component';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { EmployeeManagementService } from '../employee-management.service';
import { Helper } from 'src/app/modules/shared/utility/Helper';
import { RoleModel } from 'src/app/modules/shared/models/role-model';
import { RoleManagementService } from 'src/app/modules/shared/services/role-management.service';
import { DatastateService } from '../../datastate-management/datastate.service';
import { FilterConfig } from 'src/app/modules/shared/components/dropdown-filter/filter-config';
import { FilterType } from 'src/app/modules/shared/enum/filter-type.enum';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-edit-employee',
  templateUrl: './add-edit-employee.component.html',
  styleUrls: ['./add-edit-employee.component.scss']
})
export class AddEditEmployeeComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  action: TblActionType;
  employeeModel: EmployeeModel;
  frmEmployee: FormGroup;
  isLoading = false;
  editorOptions = QuillConfiguration;
  user;
  listRoles: RoleModel[] = [];
  listCountries: any;
  configFilterContries: FilterConfig;
  countriesData: any[] = [];
  isGettingCountries: boolean = false;
  selectedCountry: any;

  genders: any[] = [
    { name: 'Male', key: 'Male' },
    { name: 'Female', key: 'Female' },
    { name: 'Other', key: 'Other' },
  ];

  constructor(
    public dialModalRef: MatDialogRef<AddEditEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private frmBuilder: RxFormBuilder,
    private authService: NbAuthService,
    private toast: NbToastrService,
    private cdref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private employeeService: EmployeeManagementService,
    private roleService: RoleManagementService,
    private dataStateService: DatastateService,
    private messageService: MessageService,
  ) {
    this.action = data?.action;
    this.employeeModel = data?.model ?? new EmployeeModel();
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.user = token.getPayload();
      }
    });
    this.configFilterContries = {
      filterType: FilterType.DropDown,
      filterValue: this.dataStateService.getListCountries().pipe(map(resp => {
        if (resp) {
          return resp.map(item => Object.assign({ text: `${item?.name?.common}`, value: item?.name?.common, img: item?.flags?.png }));
        } else return [];
      })),
      displayText: 'text',
      displayValue: 'value',
      displayImg: 'img',
      firstLoad: true
    } as FilterConfig;
  }

  ngOnInit() {
    this.loadCountriesData();
    this.frmEmployee = this.frmBuilder.formGroup(EmployeeModel, this.employeeModel);
    this.frmEmployee?.get('birth')?.setValue(this.employeeModel?.birth ? new Date(this.employeeModel?.birth) : null);
    this.frmEmployee?.get('dateStartContract')?.setValue(this.employeeModel.dateStartContract ? new Date(this.employeeModel?.dateStartContract) : null);
    this.dialModalRef.updatePosition({ right: '0', });
    this.roleService.getRoles().subscribe(res => {
      if (res.result != null && res.result.length > 0) {
        this.listRoles = [...res.result];
      }
    });
  }

  async loadCountriesData() {
    this.isGettingCountries = true;
    this.countriesData = await lastValueFrom(this.dataStateService.getListCountries().pipe(map(resp => {
      if (resp) {
        return resp.map(item => {
          const countryName = this.frmEmployee?.get('nationality')?.value;
          var returnObj = Object.assign({ name: `${item?.name?.common}`, img: item?.flags?.png });
          if (countryName.toLowerCase() == item?.name?.common.toLowerCase()) {
            this.frmEmployee?.get('nationality')?.setValue(item?.name?.common);
            this.selectedCountry = returnObj;
          }
          return returnObj;
        });
      } else return {};
    })));

    this.isGettingCountries = false;
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
    if (this.frmEmployee.valid) {
      this.isLoading = !this.isLoading;
      const model: EmployeeModel = Object.assign({}, this.frmEmployee.value);
      // model.base64IMG = this.headShot.pictureHeadShot?.substring(this.headShot.pictureHeadShot?.lastIndexOf(',') + 1);
      // model.pictureURL = this.userModel.pictureURL;
      let isEmptyPassword = false;
      if (this.action == 0 && !model.password && !model.confirmPassword) {
        isEmptyPassword = true;
        model.password = Helper.makeid(6);
      }

      this.employeeService.saveEmployee(model).subscribe(resp => {
        if (resp.result) {
          this.messageService.add({
            key: 'toast1', severity: 'success', summary: 'Success',
            detail: `Save employee successfully`, life: 2000
          });

          if (this.action == 0 && isEmptyPassword) {
            // this.userService.sendEmailResetPassword(resp.result.id).subscribe(emailResp => {
            //   if (emailResp.result) {
            //     this.toast.success(
            //       `Please check email ${resp.result.email} to reset password`,
            //       "Success")
            //   }
            // })
          }

          this.dialModalRef.close(resp.result);
        } else {
          this.toast.danger(resp.message, 'Failure');
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
      });
    }
  }

  onChooseNationality(e) {
    if (e) {
      this.frmEmployee?.get('nationality')?.setValue(e.value);
      // this.selectedCountry = e.value;
      let selectedIndex = this.countriesData.findIndex(x => x.name.toLowerCase() === e.value.toLowerCase());
      if (selectedIndex != -1) this.selectedCountry = this.countriesData[selectedIndex];
    }
  }
}