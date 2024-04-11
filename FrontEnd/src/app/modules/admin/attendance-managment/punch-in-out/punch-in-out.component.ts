import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { WebcamComponent } from '../webcam/webcam.component';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { AttendanceManagementService } from '../attendance-management.service';
import { AttendanceModel } from '../attendance.model';
import { DateRangeModel } from 'src/app/modules/shared/models/dateRangeModel';
import { lastValueFrom } from 'rxjs';
import { WebcamMode } from '../webcam/webcamMode';

@Component({
  selector: 'app-punch-in-out',
  templateUrl: './punch-in-out.component.html',
  styleUrls: ['./punch-in-out.component.scss']
})
export class PunchInOutComponent implements OnInit {
  @ViewChild('webcamComp', { static: true }) webcamComp: WebcamComponent;
  employeeModel: EmployeeModel;

  isOpenCamera: boolean = true;
  isAddingRecord: boolean = false;
  webcamMode = WebcamMode;
  currentDate: Date = new Date();
  attendanceRecords: AttendanceModel[] = [];
  punchInRecords: Date[] = [];
  punchOutRecords: Date[] = [];
  isPunchIn: boolean = true;
  constructor(
    public dialModalRef: MatDialogRef<PunchInOutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private messageService: MessageService,
    private attendanceService: AttendanceManagementService
  ) {
    if (data.model) this.employeeModel = data.model;
  }

  ngOnInit(): void {
    this.initData();
  }

  async initData() {
    let dateRange: DateRangeModel = new DateRangeModel(new Date(), new Date());
    var dateRangeRes = await lastValueFrom(this.attendanceService.getAttendanceByEmployeeId(this.employeeModel.userId, dateRange));
    if(dateRangeRes?.result?.length > 0) {
      this.punchInRecords = [],
      this.punchOutRecords = [];
      this.attendanceRecords = dateRangeRes.result;
      for(var attendance of this.attendanceRecords) {
        if(attendance.punchinDate) this.punchInRecords = this.punchInRecords.concat(attendance.punchinDate);
        if(attendance.punchoutDate) this.punchOutRecords = this.punchOutRecords.concat(attendance.punchoutDate);
      }
      // Get first record because API order by date desc
      var firstRecord = this.attendanceRecords[0];
      this.isPunchIn = firstRecord.punchoutDate != null;
    }
    this.isAddingRecord = false;
  }

  closeDialog() {
    this.webcamComp.turnOffCamera();
    this.dialModalRef.close();
  }

  async onClickPunchInOut() {
    var checkFaceResult = await this.webcamComp.recogFaceNoInterval(this.employeeModel.userId);
    if(checkFaceResult) {
      this.isAddingRecord = true;
      let clickedTime = new Date();
      let model: AttendanceModel = new AttendanceModel();
      if(this.isPunchIn) {
        model.punchinDate = clickedTime;
        model.punchinTime = clickedTime.getMilliseconds();
        model.punchinOffset = clickedTime.getTimezoneOffset();
        model.punchinNote = "";
      } else {
        model.punchoutDate = clickedTime;
        model.punchoutTime = clickedTime.getMilliseconds();
        model.punchoutOffset = clickedTime.getTimezoneOffset();
        model.punchoutNote = "";
      }
      // this.attendanceService.punchInOut(this.isPunchIn, this.employeeModel.userId, model).subscribe(res => {
      //   if(res.result) {
      //     this.messageService.add({
      //       key: 'toast1', severity: 'success', summary: 'Success',
      //       detail: `Punched ${this.isPunchIn ? "in" : "out"} successfully!`, life: 2000
      //     });
      //     this.initData();
      //   } 
      //   this.isAddingRecord = false;
      // });
    } else {
      this.messageService.add({
        key: 'toast1', severity: 'warn', summary: 'Warn',
        detail: `Can't detect your face, please try again!`, life: 2000
      });
    }
  }
}
