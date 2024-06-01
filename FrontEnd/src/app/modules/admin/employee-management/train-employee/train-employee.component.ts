import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { WebcamComponent } from '../../attendance-managment/webcam/webcam.component';
import { TrainEmployeeService } from './train-employee.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-train-employee',
  templateUrl: './train-employee.component.html',
  styleUrls: ['./train-employee.component.scss']
})
export class TrainEmployeeComponent implements OnInit {
  @ViewChild('stepper', { static: true }) stepper: MatStepper;
  @ViewChild('webcamComp', { static: true }) webcamComp: WebcamComponent;
  employeeModel: EmployeeModel;

  editableSteps = Array(4).fill(true);
  currentStep: number = 0;
  isOpenCamera: boolean = true;
  isStartStep: boolean = false;
  allFiles: File[] = [];

  constructor(
    public dialModalRef: MatDialogRef<TrainEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private trainEmployeeService: TrainEmployeeService,
    private messageService: MessageService
  ) {
    if (data.model) this.employeeModel = data.model;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.webcamComp.turnOffCamera();
    this.dialModalRef.close();
  }

  async startDetection() {
    switch (this.currentStep) {
      case 3:
        this.isStartStep = true;
        this.trainEmployeeService.traningUserFace(this.employeeModel.userId, this.allFiles).subscribe(res => {
          this.messageService.clear();
          if(res.result) {
            this.messageService.add({
              key: 'toast1', severity: 'success', summary: 'Success',
              detail: `Add user face successfully!`, life: 2000
            });
            this.dialModalRef.close();
          } else  this.messageService.add({
            key: 'toast1', severity: 'error', summary: 'Error',
            detail: `Add user face failed!`, life: 2000
          });
          this.isStartStep = false;
        });
        break;
      default:
        this.isStartStep = true;
        await this.webcamComp.captureImages(this.currentStep);
        break;
    }

  }

  onSelectStepperChange(index: any) {
    this.currentStep = index;
    this.stepper.selectedIndex = index;
    for (var i = 0; i < index; i++) {
      this.editableSteps[i] = false;
    }
  }

  finishCapturing(event: any) {
    this.isStartStep = false;
    if (event && event?.length > 0) {
      this.allFiles = this.allFiles.concat(event);
      this.onSelectStepperChange(this.stepper.selectedIndex + 1)
    }
  }
}
