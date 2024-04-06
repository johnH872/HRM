import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as faceapi from '@vladmandic/face-api';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { WebcamMode } from './webcamMode';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements OnInit, OnDestroy {

  @ViewChild('video', { static: true })
  public video: ElementRef;
  @ViewChild('canvas', { static: true })
  public canvasRef: ElementRef;
  @Input() isOpenCamera: boolean = false;
  @Input() mode: number = WebcamMode.Detection;
  @Output() finishCapturing = new EventEmitter<any>();


  stream: any;
  detection: any;
  resizedDetections: any;
  canvas: any;
  canvasEl: any;
  displaySize: any;
  videoInput: any;
  fullFaceDescriptions: any;
  detectionInterval: any;
  captureInterval: any;

  isCollectingImages: boolean = false;

  constructor(private elRef: ElementRef, private http: HttpClient) { }

  ngOnInit(): void {
    this.setUpData();
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
    if (this.isOpenCamera) {
      navigator.mediaDevices.getUserMedia({ video: {}, audio: false })
        .then((stream) => {
          this.videoInput.srcObject = stream;
        })
        .catch((err) => {
          console.log(err);
        });
      switch (this.mode) {
        case WebcamMode.Detection:
          this.detectFaces();
          break;
        case WebcamMode.Recognition:
          this.recogFace();
          break;
      }
    }
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
      faceapi.matchDimensions(this.canvas, this.displaySize);
      this.detectionInterval = setInterval(async () => {
        this.detection = await faceapi.detectSingleFace(this.videoInput, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions();
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.detection) {
          this.resizedDetections = faceapi.resizeResults(
            this.detection,
            this.displaySize
          );
          // faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
          // faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
          // faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
        }
      }, 300);
    });
  }

  async recogFace() {
    this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
      this.canvas = faceapi.createCanvasFromMedia(this.videoInput);
      this.canvasEl = this.canvasRef.nativeElement;
      this.canvasEl.appendChild(this.canvas);
      this.canvas.setAttribute('id', 'canvass');
      this.displaySize = {
        width: this.videoInput.width,
        height: this.videoInput.height,
      };
      faceapi.matchDimensions(this.canvas, this.displaySize);
      const JSONparseFaceMatcher = await lastValueFrom(this.http.get("./assets/traning_model/faceMatcher.json"));
      const FaceMatcherFromJSON = faceapi.FaceMatcher.fromJSON(JSONparseFaceMatcher);
      const labeledDescriptors = FaceMatcherFromJSON.labeledDescriptors;
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);

      this.captureInterval = setInterval(async () => {
        this.detection = await faceapi.detectSingleFace(this.videoInput, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.75, maxResults: 1 })).withFaceLandmarks().withFaceDescriptor();
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.detection) {
          const bestMatch = faceMatcher.findBestMatch(this.detection.descriptor);
          this.resizedDetections = faceapi.resizeResults(
            this.detection,
            this.displaySize
          );
          const box = this.resizedDetections.detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString(true) });
          drawBox.draw(this.canvas);
        }
      }, 300);
    });
  }

  async recogFaceNoInterval(userId: string): Promise<boolean> {
    var result = false
    const JSONparseFaceMatcher = await lastValueFrom(this.http.get("./assets/traning_model/faceMatcher.json"));
    const FaceMatcherFromJSON = faceapi.FaceMatcher.fromJSON(JSONparseFaceMatcher);
    const labeledDescriptors = FaceMatcherFromJSON.labeledDescriptors;
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);
    this.detection = await faceapi.detectSingleFace(this.videoInput, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.75, maxResults: 1 })).withFaceLandmarks().withFaceDescriptor();
    if (this.detection) {
      const bestMatch = faceMatcher.findBestMatch(this.detection.descriptor);
      console.log(bestMatch.distance);
      if (bestMatch.distance > 0.5 && bestMatch.label === userId) result = true;
    }
    return result;
  }

  async captureImages(startIndex: number = 0) {
    var images = [];
    var interations = 0;
    this.canvas.style.display = 'none';

    console.log( this.videoInput.width,)

    this.canvas.width = 80* window.innerWidth/100;
    this.canvas.height = window.innerHeight;

    this.captureInterval = setInterval(async () => {
      try {
        this.canvas
          .getContext("2d")
          .drawImage(this.videoInput, 0, 0,80* window.innerWidth/100, window.innerHeight);
        // Convert canvas data to a Blob
        this.canvas.toBlob(blob => {
          // Create a new File object
          // saveAs(blob, `${startIndex * 10 + interations}.png`);
          const file = new File([blob], `${startIndex * 10 + interations}.png`, { type: 'image/jpg' });
          images.push(file);
        }, 'image/png');
        interations++;
        if (interations == 11) {
          clearInterval(this.captureInterval);
          this.finishCapturing.emit(images);
        }
      } catch (error) {
        console.log(error);
        this.finishCapturing.emit([]);
      }
    }, 500);
  }

  ngOnDestroy(): void {
    clearInterval(this.detectionInterval);
    clearInterval(this.captureInterval);
    this.videoInput.srcObject = null;
  }

  turnOffCamera() {
    clearInterval(this.detectionInterval);
    clearInterval(this.captureInterval);
    this.videoInput.srcObject = null;
  }
}
