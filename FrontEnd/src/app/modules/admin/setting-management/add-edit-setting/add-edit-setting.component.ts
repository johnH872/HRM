import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { EditSettingModel, SettingModel } from '../setting-management.model';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SettingManagementService } from '../setting-management.service';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbToastrService } from '@nebular/theme';
import { NbAccessChecker } from '@nebular/security';
import { ConfirmModalComponent } from 'src/app/modules/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-add-edit-setting',
  templateUrl: './add-edit-setting.component.html',
  styleUrls: ['./add-edit-setting.component.scss']
})
export class AddEditSettingComponent implements OnInit, OnDestroy, AfterViewInit {

  private destroy$: Subject<void> = new Subject<void>();
  currentUser;
  action: TblActionType;
  settingModel: SettingModel;
  oldSettingModel: SettingModel;
  frmSetting: FormGroup;
  isLoading = false;
  isChange: boolean = false;
  hasEditPermission: boolean = false;

  constructor(
    public dialModalRef: MatDialogRef<AddEditSettingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settingService: SettingManagementService,
    private frmBuilder: RxFormBuilder,
    private authService: NbAuthService,
    private toast: NbToastrService,
    private cdref: ChangeDetectorRef,
    private dialog: MatDialog,
    private permissionService: NbAccessChecker,
  ) {
    this.action = data?.action ?? TblActionType.Add;
    this.settingModel = data?.model ?? new SettingModel();
    this.oldSettingModel = data?.model ?? new SettingModel();
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
    this.frmSetting = this.frmBuilder.formGroup(SettingModel, this.settingModel);
    this.dialModalRef.updatePosition({ right: '0', });
    if (this.action === TblActionType.Add) {
      
    }
    if (this.action === TblActionType.Edit) {
      
    }
  }

  ngAfterViewInit(): void {
    if (this.frmSetting)
      this.frmSetting.valueChanges.pipe(take(1))
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
    if (this.frmSetting.valid) {
      this.isLoading = !this.isLoading;
      const newSetting: SettingModel = Object.assign({}, this.frmSetting.value);
      const model: EditSettingModel = new EditSettingModel();
      model.newSetting = newSetting;
      model.newSetting.key = model.newSetting.key.toUpperCase();
      model.newSetting.group = model.newSetting.group.toUpperCase();
      model.oldSetting = this.oldSettingModel;
      this.settingService.saveSetting(model).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp.result) {
          this.toast.success(`Save setting successfully`, 'Success');
          this.dialModalRef.close(resp.result);
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
      });
    }
  }
}