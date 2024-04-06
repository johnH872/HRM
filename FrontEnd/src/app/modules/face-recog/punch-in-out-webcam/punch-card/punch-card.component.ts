import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { AttendanceManagementService } from 'src/app/modules/admin/attendance-managment/attendance-management.service';
import { AttendanceModel } from 'src/app/modules/admin/attendance-managment/attendance.model';
import { DEFAULT_AVATAR_URL } from 'src/app/modules/shared/constants';
import { DateRangeModel } from 'src/app/modules/shared/models/dateRangeModel';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';

@Component({
  selector: 'app-punch-card',
  templateUrl: './punch-card.component.html',
  styleUrls: ['./punch-card.component.scss']
})
export class PunchCardComponent implements OnInit {
  employeeModel: EmployeeModel = new EmployeeModel();
  defaultAvatar = DEFAULT_AVATAR_URL;
  isPunchIn = true;
  punchInRecords: Date[] = [];
  punchOutRecords: Date[] = [];
  attendanceRecords: AttendanceModel[] = [];
  isAddingRecord = false;
  isInitData = false;
  constructor(
    public dialModalRef: MatDialogRef<PunchCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private attendanceService: AttendanceManagementService,
    private messageService: MessageService
  ) {
    if (data.model) this.employeeModel = data.model;
  }

  ngOnInit(): void {
    this.initData();
  }

  async initData() {
    this.isInitData = true;
    let startDate = new Date();
    let endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 99);
    let dateRange: DateRangeModel = new DateRangeModel(startDate, endDate);
    var dateRangeRes = await lastValueFrom(this.attendanceService.getAttendanceByEmployeeId(this.employeeModel?.userId, dateRange));
    if (dateRangeRes?.result?.length > 0) {
      this.punchInRecords = [];
      this.punchOutRecords = [];
      this.attendanceRecords = dateRangeRes.result;
      for (var attendance of this.attendanceRecords) {
        if (attendance.punchinDate) this.punchInRecords = this.punchInRecords.concat(attendance.punchinDate);
        if (attendance.punchoutDate) this.punchOutRecords = this.punchOutRecords.concat(attendance.punchoutDate);
      }
      // Get first record because API order by date desc
      var firstRecord = this.attendanceRecords[0];
      this.isPunchIn = firstRecord.punchoutDate != null;
    }
    this.isInitData = false;
  }

  onCancel() {
    this.dialModalRef.close();
  }

  async onSubmit() {
    this.isAddingRecord = true;
    let clickedTime = new Date();
    let model: AttendanceModel = new AttendanceModel();
    if (this.isPunchIn) {
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
    this.attendanceService.punchInOut(this.isPunchIn, this.employeeModel.userId, model).subscribe(res => {
      if (res.result) {
        this.messageService.add({
          key: 'toast1', severity: 'success', summary: 'Success',
          detail: `Punched ${this.isPunchIn ? "in" : "out"} successfully!`, life: 2000
        });
        this.initData();
      }
      this.isAddingRecord = false;
      this.dialModalRef.close();
    });
  }
}
