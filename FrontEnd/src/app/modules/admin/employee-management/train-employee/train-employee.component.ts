import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { EmployeeModel } from 'src/app/modules/shared/models/employee.model';
import { WebcamComponent } from '../../attendance-managment/webcam/webcam.component';

@Component({
  selector: 'app-train-employee',
  templateUrl: './train-employee.component.html',
  styleUrls: ['./train-employee.component.scss']
})
export class TrainEmployeeComponent implements OnInit{
  @ViewChild('stepper', {static: true}) stepper: MatStepper;
  @ViewChild('webcamComp', {static: true}) webcamComp: WebcamComponent;
  employeeModel: EmployeeModel;
  
  editableSteps = Array(4).fill(true);
  currentStep: number = 0;
  isOpenCamera: boolean = true;
  isCapturing: boolean = false;

  constructor(
    public dialModalRef: MatDialogRef<TrainEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if(data.model) this.employeeModel = data.model;
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialModalRef.close();
    this.webcamComp.turnOffCamera();
  }

  async startDetection() {
    this.isCapturing = true;
    await this.webcamComp.captureImages();
  }

  onSelectStepperChange(index: any) {
    this.currentStep = index;
    for(var i = 0; i< index; i++) {
      this.editableSteps[i] = false;
    }
  }
}
