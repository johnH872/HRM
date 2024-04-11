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
  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
    private employeeManagementService: EmployeeManagementService,
    private dialog: MatDialog
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
          this.resizedDetections = faceapi.resizeResults(
            this.detection,
            this.displaySize
          );
          const box = this.resizedDetections.detection.box;
          if (!this.detectedMaps.has(bestMatch.label)) this.detectedMaps.set(bestMatch.label, 0);
          else if (bestMatch.distance <= 0.45) {
            var existedCount = this.detectedMaps.get(bestMatch.label);
            ++existedCount;
            this.detectedMaps.set(bestMatch.label, existedCount);
            if (existedCount == 5 && this.cancelClickCouting != 3) this.employeeManagementService.getEmployeeById(bestMatch?.label).subscribe(res => {
              this.canvas
                .getContext("2d")
                .drawImage(this.videoInput, 0, 0, window.innerWidth, window.innerHeight);

              this.canvas.toBlob((blob: any) => {
                if (res.result) {
                  this.isOpeningDialog = true;
                  this.dialog.open(PunchCardComponent, {
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
            })
          }
          if (this.cancelClickCouting == 3) {
            this.isOpeningDialog = true;
            this.dialog.open(AlertCardComponent, {
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
                    width: 'auto',
                    height: 'auto',
                    backdropClass: 'custom-backdrop',
                    hasBackdrop: true,
                    data: {
                      blobImage: blob,
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
          const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString(true) });
          drawBox.draw(this.canvas);
        }
      }, 300);
    });
  }
}
