import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbGlobalLogicalPosition, NbToastrService } from '@nebular/theme';
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
import { TrainEmployeeService } from '../train-employee/train-employee.service';

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
  user: any;
  listRoles: RoleModel[] = [];
  listCountries: any;
  configFilterContries: FilterConfig;
  countriesData: any[] = [];
  isGettingCountries: boolean = false;
  selectedCountry: any;
  listEmployees: EmployeeModel[];
  selectedEmployee: EmployeeModel;
  isAdmin: boolean = false;
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
    private trainService: TrainEmployeeService
  ) {
    this.action = data?.action;
    this.employeeModel = data?.model ?? new EmployeeModel();
    this.listEmployees = data?.listEmployees ?? [];
    this.isAdmin = data.isAdmin;

    this.authService.onTokenChange().pipe(takeUntil(this.destroy$)).subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.user = token.getPayload().user;
      }
    });
    // this.configFilterContries = {
    //   filterType: FilterType.DropDown,
    //   filterValue: this.dataStateService.getListCountries().pipe(map(resp => {
    //     if (resp) {
    //       return resp.map(item => Object.assign({ text: `${item?.name?.common}`, value: item?.name?.common, img: item?.flags?.png }));
    //     } else return [];
    //   })),
    //   displayText: 'text',
    //   displayValue: 'value',
    //   displayImg: 'img',
    //   firstLoad: true
    // } as FilterConfig;
  }

  ngOnInit() {
    this.loadCountriesData();
    this.frmEmployee = this.frmBuilder.formGroup(EmployeeModel, this.employeeModel);
    this.loadAllEmployeeData();
    this.frmEmployee?.get('birth')?.setValue(this.employeeModel?.birth ? new Date(this.employeeModel?.birth) : null);
    this.frmEmployee?.get('dateStartContract')?.setValue(this.employeeModel.dateStartContract ? new Date(this.employeeModel?.dateStartContract) : null);
    this.dialModalRef.updatePosition({ right: '0', });
    this.roleService.getRoles().subscribe(res => {
      if (res.result != null && res.result.length > 0) {
        this.listRoles = [...res.result];
      }
    });
    
    // disbale uneditable fields
    if(this.action === TblActionType.Edit) {
      this.frmEmployee.get('email').disable();
      if(!this.isAdmin) {
        this.frmEmployee.get('roleId').disable();
        this.frmEmployee.get('dateStartContract').disable();
        this.frmEmployee.get('ownerId').disable();
      }
    }
  }

  async loadAllEmployeeData() {
    if (this.listEmployees?.length <= 0) {
      var respListEmployee = await lastValueFrom(this.employeeService.getAllEmployee());
      if (respListEmployee.result) {
        this.listEmployees = respListEmployee.result;
        this.onChangeEmployee({value: this.employeeModel.ownerId})
      }
    }
  }

  async loadCountriesData() {
    this.isGettingCountries = true;
    this.countriesData = await lastValueFrom(this.dataStateService.getListCountries().pipe(map(resp => {
      // if (resp) {
      //   return resp.map(item => {
      //     const countryName = this.frmEmployee?.get('nationality')?.value;
      //     var returnObj = Object.assign({ name: `${item?.name?.common}`, img: item?.flags?.png });
      //     if (countryName?.toLowerCase() == item?.name?.common?.toLowerCase()) {
      //       this.frmEmployee?.get('nationality')?.setValue(item?.name?.common);
      //       this.selectedCountry = returnObj;
      //     }
      //     return returnObj;
      //   });
      // } else return {};
      if (resp?.data) {
        return resp?.data?.map(item => {
          const countryName = this.frmEmployee?.get('nationality')?.value;
          var returnObj = Object.assign({ name: `${item?.name}`, img: item?.flag });
          if (countryName?.toLowerCase() == item?.name?.toLowerCase()) {
            this.frmEmployee?.get('nationality')?.setValue(item?.name);
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
          this.dialModalRef.close(resp.result);
        } else {
          this.toast.danger(resp.message, 'Failure', {position: NbGlobalLogicalPosition.BOTTOM_END});
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
      });
    }
  }

  onChangeEmployee(e: any) {
    if(e) {
      this.frmEmployee.get('ownerId').setValue(e.value);
      var currentEmpIndex = this.listEmployees.findIndex(x => x.userId === e.value);
      if(currentEmpIndex != -1 ) this.selectedEmployee = this.listEmployees[currentEmpIndex];
    }
  }

  onChooseNationality(e) {
    if (e) {
      this.frmEmployee?.get('nationality')?.setValue(e.value);
      let selectedIndex = this.countriesData.findIndex(x => x.name.toLowerCase() === e.value.toLowerCase());
      if (selectedIndex != -1) this.selectedCountry = this.countriesData[selectedIndex];
    }
  }
  
  async onChangeAvatar(event: any) {
    if(this.isLoading) return;
    const file = event.target.files[0] as File;
    this.isLoading = true;
    var res = await lastValueFrom(this.trainService.uploadImage(this.employeeModel.userId, file));
    this.isLoading = false;
    if(res.result) {
      this.messageService.add({
        key: 'toast1', severity: 'success', summary: 'Success',
        detail: `Save employee successfully`, life: 2000
      });
      this.dialModalRef.close(true);
    } else {
      this.messageService.add({
        key: 'toast1', severity: 'error', summary: 'Failed',
        detail: `Upload image failed`, life: 2000
      });
    }
  }
}