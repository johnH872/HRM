import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FaceRecogRoutingModule } from './face-recog-routing.module';
import { PunchInOutWebcamComponent } from './punch-in-out-webcam/punch-in-out-webcam.component';
import { PunchCardComponent } from './punch-in-out-webcam/punch-card/punch-card.component';
import { ThemeModule } from 'src/app/@theme/theme.module';
import { SharedModule } from '../shared/shared.module';
import { AlertCardComponent } from './punch-in-out-webcam/alert-card/alert-card.component';
import { ReportAttendanceDialogComponent } from './punch-in-out-webcam/report-attendance-dialog/report-attendance-dialog.component';
import { InfoCardComponent } from './punch-in-out-webcam/info-card/info-card.component';


@NgModule({
  declarations: [
    PunchInOutWebcamComponent,
    PunchCardComponent,
    AlertCardComponent,
    ReportAttendanceDialogComponent,
    InfoCardComponent
  ],
  imports: [
    SharedModule,
    ThemeModule,
    CommonModule,
    FaceRecogRoutingModule,
    
    // MatDialogModule,
    // ToastModule
  ]
})
export class FaceRecogModule { }
