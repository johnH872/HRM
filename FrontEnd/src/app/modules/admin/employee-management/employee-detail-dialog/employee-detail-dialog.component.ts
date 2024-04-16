import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttendanceManagementService } from '../../attendance-managment/attendance-management.service';
import { MessageService } from 'primeng/api';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';

@Component({
  selector: 'app-employee-detail-dialog',
  templateUrl: './employee-detail-dialog.component.html',
  styleUrls: ['./employee-detail-dialog.component.scss']
})
export class EmployeeDetailDialogComponent implements OnInit, OnDestroy {
  employeeModel: EmployeeModel;
  constructor(
    public dialModalRef: MatDialogRef<EmployeeDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private attendanceService: AttendanceManagementService,
    private messageService: MessageService,
    private frmBuilder: RxFormBuilder,
  ) {
    if(this.data.model) this.employeeModel = this.data.model;
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    
  }

  closeDialog() {
    this.dialModalRef.close(false);
  }
}
