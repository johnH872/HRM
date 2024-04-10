import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { MessageService } from 'primeng/api';
import { AttendanceManagementService } from 'src/app/modules/admin/attendance-managment/attendance-management.service';
import { ReportAttendanceModel } from './report-attendance.model';

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
  constructor(
    public dialModalRef: MatDialogRef<ReportAttendanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private attendanceService: AttendanceManagementService,
    private messageService: MessageService,
    private frmBuilder: RxFormBuilder,
  ) {
    if (data.blobImage) this.blobImage = data.blobImage;
    if (data.captureImg) this.captureImg = data.captureImg;
    this.windowWith = 40 * window.innerWidth / 100;
    this.windowHeight = 40 * window.innerHeight / 100;
  }

  ngOnInit(): void {
    this.frmReport = this.frmBuilder.formGroup(ReportAttendanceModel, this.reportAttendanceModel);
  }

  closeDialog() {

  }

  onSendReport() {

  }
}
