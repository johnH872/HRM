import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { MessageService } from 'primeng/api';
import { AttendanceManagementService } from 'src/app/modules/admin/attendance-managment/attendance-management.service';
import { ReportAttendanceModel } from './report-attendance.model';
import { TblActionType } from 'src/app/modules/shared/enum/tbl-action-type.enum';
import { LeaveRequestStatus } from 'src/app/modules/shared/enum/leave-request-status.enum';

@Component({
  selector: 'app-report-attendance-dialog',
  templateUrl: './report-attendance-dialog.component.html',
  styleUrls: ['./report-attendance-dialog.component.scss']
})
export class ReportAttendanceDialogComponent implements OnInit {
  blobImage: Blob = null;
  captureImg: any;
  windowWith: number = 0;
  windowHeight: number = 0;
  frmReport: FormGroup;
  reportAttendanceModel: ReportAttendanceModel = new ReportAttendanceModel();
  isLoading: boolean = false;
  imageFile: File;
  punchTypes: any[];
  action: TblActionType;
  actionTypes = TblActionType;
  constructor(
    public dialModalRef: MatDialogRef<ReportAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private attendanceService: AttendanceManagementService,
    private messageService: MessageService,
    private frmBuilder: RxFormBuilder,
  ) {
    if (data.blobImage) this.blobImage = data.blobImage;
    if (data.captureImg) this.captureImg = data.captureImg;
    this.action = data.action || TblActionType.Add;
    this.windowWith = 40 * window.innerWidth / 100;
    this.windowHeight = 40 * window.innerHeight / 100;

    this.punchTypes = [
      { name: 'Punch in', code: 'PUNCHIN' },
      { name: 'Punch out', code: 'PUNCHOUT' },
    ];

  }

  ngOnInit(): void {
    if(this.action === TblActionType.Add) {
      this.reportAttendanceModel.type = this.punchTypes[0].code;
      this.imageFile = new File([this.blobImage], `report-${new Date().valueOf()}.png`, { type: 'image/jpg' });
    } else {
      this.reportAttendanceModel = this.data.model;
    }
    this.frmReport = this.frmBuilder.formGroup(ReportAttendanceModel, this.reportAttendanceModel);
    if(this.action === TblActionType.Edit) this.frmReport.disable();
  }

  closeDialog() {
    this.dialModalRef.close(false);
  }

  onSendReport() {
    if (this.frmReport.valid) {
      this.isLoading = true;
      this.attendanceService.sendAttendanceReport(this.imageFile, this.reportAttendanceModel).subscribe(res => {
        if (res.result) {
          this.messageService.add({
            key: 'toast1', severity: 'success', summary: 'Success',
            detail: `Report attendance successfully!`, life: 2000
          });
        }
        this.dialModalRef.close(true);
        this.isLoading = false;
      })
    }
  }

  onSaveAttendanceReport(isApprove: boolean) {
    this.reportAttendanceModel.statusId = isApprove ? LeaveRequestStatus.APPROVED : LeaveRequestStatus.REJECTED;
    this.attendanceService.saveAttendanceReport(this.reportAttendanceModel).subscribe(res => {
      if (res.result) {
        this.dialModalRef.close({isApprove});
      } else {
        this.dialModalRef.close(false);
      }
     
    });
  }
}
