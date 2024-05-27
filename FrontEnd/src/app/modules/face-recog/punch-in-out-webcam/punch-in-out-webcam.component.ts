import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as faceapi from '@vladmandic/face-api';
import { lastValueFrom } from 'rxjs';
import { EmployeeManagementService } from '../../admin/employee-management/employee-management.service';
import { MatDialog } from '@angular/material/dialog';
import { PunchCardComponent } from './punch-card/punch-card.component';
import { environment } from 'src/enviroments/enviroment';
import { AlertCardComponent } from './alert-card/alert-card.component';
import { ReportAttendanceDialogComponent } from './report-attendance-dialog/report-attendance-dialog.component';
import { TblActionType } from '../../shared/enum/tbl-action-type.enum';
import { WorkCalendarManagementService } from '../../admin/work-calendar-management/work-calendar-management.service';
import * as moment from 'moment';
import { LeaveRequestManagementService } from '../../admin/leave-request-management/leave-request-management.service';
import { AttendanceManagementService } from '../../admin/attendance-managment/attendance-management.service';
import { DateRangeModel } from '../../shared/models/dateRangeModel';
import { LeaveRequestStatus } from '../../shared/enum/leave-request-status.enum';
import { SettingManagementService } from '../../admin/setting-management/setting-management.service';
import { WorkCalendarModel } from '../../admin/work-calendar-management/work-calendar-management.model';
import { InfoCardComponent } from './info-card/info-card.component';
import { InforCardType } from '../../shared/enum/info-card-type.enum';
import { LeaveRequestModel } from '../../admin/leave-request-management/leave-request-management.model';

@Component({
  selector: 'app-punch-in-out-webcam',
  templateUrl: './punch-in-out-webcam.component.html',
  styleUrls: ['./punch-in-out-webcam.component.scss']
})
export class PunchInOutWebcamComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true })
  public video: ElementRef;

  @ViewChild('canvas', { static: true })
  public canvasRef: ElementRef;

  videoInput: any;
  canvas: any;
  canvasEl: any;
  displaySize: any;
  detection: any;
  resizedDetections: any;
  detectedCount: number = 0;
  cameraInterval: any;
  detectedMaps: Map<String, number> = new Map();
  isOpeningDialog: boolean = false;
  cancelClickCouting: number = 0;
  infoCardtype: InforCardType = InforCardType.WORK_CALENDAR;
  leaveModel: LeaveRequestModel = new LeaveRequestModel();
  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
    private dialog: MatDialog,
    private employeeManagementService: EmployeeManagementService,
    private workCalendarService: WorkCalendarManagementService,
    private leaveRequestService: LeaveRequestManagementService,
    private attendanceService: AttendanceManagementService,
    private settingService: SettingManagementService
  ) {

  }

  ngOnInit(): void {
    this.setUpData();
  }

  ngOnDestroy(): void {
    clearInterval(this.cameraInterval);
  }

  async setUpData() {
    await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
    await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
    await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
    await faceapi.nets.ssdMobilenetv1.loadFromUri('../../assets/models'),
    await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models'),]).then(() => this.initVideo());
  }

  initVideo() {
    this.videoInput = this.video.nativeElement;
    navigator.mediaDevices.getUserMedia({ video: {}, audio: false })
      .then((stream) => {
        this.videoInput.srcObject = stream;
      })
      .catch((err) => {
        console.log(err);
      });
    this.detectFaces();
  }

  async detectFaces() {
    this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
      this.canvas = faceapi.createCanvasFromMedia(this.videoInput);
      this.canvasEl = this.canvasRef.nativeElement;
      this.canvasEl.appendChild(this.canvas);
      this.canvas.setAttribute('id', 'canvass');
      this.displaySize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      // Get face matcher models for face recognition
      faceapi.matchDimensions(this.canvas, this.displaySize);
      const JSONparseFaceMatcher = await lastValueFrom(this.http.get(environment.FACE_MATCHER_MODEL_URL));
      const FaceMatcherFromJSON = faceapi.FaceMatcher.fromJSON(JSONparseFaceMatcher);
      const labeledDescriptors = FaceMatcherFromJSON.labeledDescriptors;
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);

      faceapi.matchDimensions(this.canvas, this.displaySize);
      this.cameraInterval = setInterval(async () => {
        if (this.isOpeningDialog) return;
        this.detection = await faceapi.detectSingleFace(this.videoInput, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.75, maxResults: 1 })).withFaceLandmarks().withFaceDescriptor();
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.detection) {
          const bestMatch = faceMatcher.findBestMatch(this.detection.descriptor);
          // this.resizedDetections = faceapi.resizeResults(
          //   this.detection,
          //   this.displaySize
          // );
          // const box = this.resizedDetections.detection.box;
          if (!this.detectedMaps.has(bestMatch.label)) this.detectedMaps.set(bestMatch.label, 0);
          else if (bestMatch.distance <= 0.75) {
            var existedCount = this.detectedMaps.get(bestMatch.label);
            ++existedCount;
            this.detectedMaps.set(bestMatch.label, existedCount);
            if (existedCount == 5 && this.cancelClickCouting != 3) this.employeeManagementService.getEmployeeById(bestMatch?.label).subscribe(async res => {
              this.canvas.style.display = 'none';
              this.canvas
                .getContext("2d")
                .drawImage(this.videoInput, 0, 0, window.innerWidth, window.innerHeight);

              // Check condition includes:
              // - not working time => no punch in
              // - on leaving times => no punch in
              var validAttendance = await this.checkAttendanceCondition(res.result.userId);
              if (!validAttendance) this.openReminderPopup(res.result.email);
              else {
                this.canvas.toBlob((blob: any) => {
                  if (res.result) {
                    this.isOpeningDialog = true;
                    this.dialog.open(PunchCardComponent, {
                      disableClose: true,
                      width: 'auto',
                      height: 'auto',
                      backdropClass: 'custom-backdrop',
                      hasBackdrop: true,
                      data: {
                        model: res.result,
                        blobImage: blob
                      },
                    }).afterClosed().subscribe(closeRes => {
                      if (!closeRes) this.cancelClickCouting++;
                      this.isOpeningDialog = false;
                      this.detectedMaps.clear();
                    });
                  }
                }, 'image/png');
              }
            })

          }
          if (this.cancelClickCouting == 3) {
            this.isOpeningDialog = true;
            this.dialog.open(AlertCardComponent, {
              disableClose: true,
              width: 'auto',
              height: 'auto',
              backdropClass: 'custom-backdrop',
              hasBackdrop: true,
              data: {
                // model: res.result
              }
            }).afterClosed().subscribe(closeRes => {
              if (closeRes) {
                this.canvas.style.display = 'none';

                this.canvas
                  .getContext("2d")
                  .drawImage(this.videoInput, 0, 0, window.innerWidth, window.innerHeight);
                var captureImg = this.canvas.toDataURL("image/png");
                this.canvas.toBlob((blob: any) => {
                  this.dialog.open(ReportAttendanceDialogComponent, {
                    disableClose: true,
                    width: 'auto',
                    height: 'auto',
                    backdropClass: 'custom-backdrop',
                    hasBackdrop: true,
                    data: {
                      blobImage: blob,
                      action: TblActionType.Add,
                      captureImg: captureImg,
                    }
                  }).afterClosed().subscribe(res => {
                    this.cancelClickCouting = 0;
                    this.isOpeningDialog = false;
                    this.detectedMaps.clear();
                  })
                }, 'image/png');

              } else {
                this.cancelClickCouting = 0;
                this.isOpeningDialog = false;
                this.detectedMaps.clear();
              }
            });
          }
          // const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString(true) });
          // drawBox.draw(this.canvas);
        }
      }, 300);
    });
  }

  async checkAttendanceCondition(userId: String): Promise<boolean> {
    var result: boolean = false;
    var isPunchIn: boolean = true;
    try {
      var startDate = moment().startOf('day').toDate();
      var endDate = moment().endOf('day').toDate();
      const workingdaysRes = await lastValueFrom(this.workCalendarService.getWorkCalendarByUserId(startDate, endDate, [userId]));
      const leaveRequestRest = await lastValueFrom(this.leaveRequestService.getLeaveRequestByFilter(startDate, endDate, userId));
      const attendanceResult = await lastValueFrom(this.attendanceService.getAttendanceByEmployeeId(userId as string, new DateRangeModel(startDate, endDate)));
      var workingDay = new WorkCalendarModel();
      var leaveRequests = [];
      if (attendanceResult?.result?.length > 0) {
        var firstRecord = attendanceResult.result[0];
        isPunchIn = firstRecord.punchoutDate != null;
      }
      if (workingdaysRes?.result && workingdaysRes?.result.length > 0) {
        workingDay = workingdaysRes.result[0];
        leaveRequests = leaveRequestRest.result?.filter(x => x.status == LeaveRequestStatus.APPROVED);
      }
      if (isPunchIn) {
        // If punching in, only accept if:
        // - There is a working day on the current date
        // - Punching in is not between leave-from and leave-to times
        if (workingDay && workingDay.workingHour > 0) result = true;
        if (leaveRequests.length > 0) {
          for (let leaveRequest of leaveRequests) {
            if (moment().isBetween(moment(leaveRequest.leaveDateFrom), moment(leaveRequest.leaveDateTo))) {
              result = false;
              this.infoCardtype = InforCardType.LEAVE;
              this.leaveModel = leaveRequest;
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
    return result;
  }

  openReminderPopup(email: string) {
    const title = `<div>You cannot punch in with email: <b>${email}</b>.</div> `;
    var content = ``;
    switch(this.infoCardtype) {
      case InforCardType.LEAVE:
        content = `<div>You cannot punch in because you have leave from: </div> 
                  <div><b>${moment(this.leaveModel.leaveDateFrom).format('MMMM DD, YYYY HH:mm')}</b> to <b>${moment(this.leaveModel.leaveDateTo).format('MMMM DD, YYYY HH:mm')}</b>.</div>
                  <div>If this is not you, feel fee to click on 'Cancel'.</div>`
        break;
      default:
        content = `You cannot punch in because the system doesn't recognize today as a working day for you.`
    }

    this.isOpeningDialog = true;
    this.dialog.open(InfoCardComponent, {
      disableClose: true,
      width: 'auto',
      height: 'auto',
      backdropClass: 'custom-backdrop',
      hasBackdrop: true,
      data: {
        title,
        content
      }
    }).afterClosed().subscribe(closeRes => {
      this.isOpeningDialog = false;
      this.cancelClickCouting ++;
      this.detectedMaps.clear()
    });
  }
}
