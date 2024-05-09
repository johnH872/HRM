import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { WorkCalendarDetailModel } from '../work-calendar-management.model';
import { FormGroup } from '@angular/forms';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbToastrService } from '@nebular/theme';
import { DatastateService } from '../../datastate-management/datastate.service';
import { MessageService } from 'primeng/api';
import { WorkCalendarManagementService } from '../work-calendar-management.service';
import moment from 'moment';

@Component({
  selector: 'app-add-edit-work-calendar-detail',
  templateUrl: './add-edit-work-calendar-detail.component.html',
  styleUrls: ['./add-edit-work-calendar-detail.component.scss']
})
export class AddEditWorkCalendarDetailComponent implements OnInit, OnDestroy {
  @Input() id: any;
  @Input() model: any;
  @Output() onRefresh = new EventEmitter<any>();

  user;
  private destroy$: Subject<void> = new Subject<void>();
  action: TblActionType;
  dataModel: WorkCalendarDetailModel;
  frmData: FormGroup;
  isLoading = false;
  isAdmin: boolean = false;

  constructor(
    // public dialModalRef: MatDialogRef<AddEditWorkCalendarDetailComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private frmBuilder: RxFormBuilder,
    private authService: NbAuthService,
    private toast: NbToastrService,
    private cdref: ChangeDetectorRef,
    private dataStateService: DatastateService,
    private messageService: MessageService,
    private workCalendarService: WorkCalendarManagementService,
  ) {
    // this.isAdmin = data.isAdmin;
    this.authService.onTokenChange().pipe(takeUntil(this.destroy$)).subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.user = token.getPayload().user;
      }
    });
  }

  ngOnInit() {
    this.dataModel = this.model ?? new WorkCalendarDetailModel();
    this.action = this.dataModel?.workCalendarDetailId ? TblActionType.Edit : TblActionType.Add;
    this.frmData = this.frmBuilder.formGroup(WorkCalendarDetailModel, this.dataModel);
    // this.dialModalRef.updatePosition({ right: '0', });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveData() {
    if (this.frmData?.valid) {
      this.isLoading = !this.isLoading;
      const model: WorkCalendarDetailModel = Object.assign({}, this.frmData.value);
      model.workCalendarId = this.id ?? this.model.workCalendarId;
      model.from = moment(model.from).format('HH:mm') === 'Invalid date' ? model.from : moment(model.from).format('HH:mm');
      model.to = moment(model.to).format('HH:mm') === 'Invalid date' ? model.to : moment(model.to).format('HH:mm');
      this.workCalendarService.saveWorkCalendarDetail(model).subscribe(resp => {
        if (resp.result) {
          this.messageService.add({
            key: 'toast1', severity: 'success', summary: 'Success',
            detail: `Save work calendar detail successfully`, life: 2000
          });
          this.onRefresh.emit(resp);
        } else {
          this.toast.danger(resp.message, 'Failure');
        }
      }).add(() => {
        this.isLoading = !this.isLoading;
      });
    }
  }

  deleteData() {
    this.workCalendarService.deleteWorkCalendarDetail(this.dataModel?.workCalendarDetailId).subscribe(resp => {
      if (resp.result) {
        this.messageService.add({
          key: 'toast1', severity: 'success', summary: 'Success',
          detail: `Delete work calendar detail successfully`, life: 2000
        });
        this.onRefresh.emit(resp);
      } else {
        this.toast.danger(resp.message, 'Failure');
      }
    }).add(() => {
      this.isLoading = !this.isLoading;
    });
  }
}