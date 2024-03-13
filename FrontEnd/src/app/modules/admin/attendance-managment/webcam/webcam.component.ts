import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements OnInit, OnDestroy {
  WIDTH = 1040;
  HEIGHT = 880;
  labels = ['sheldon', 'raj', 'leonard', 'howard'];

  @ViewChild('video', { static: true })
  public video: ElementRef;
  @ViewChild('canvas', { static: true })
  public canvasRef: ElementRef;

  stream: any;
  detection: any;
  resizedDetections: any;
  canvas: any;
  canvasEl: any;
  displaySize: any;
  videoInput: any;
  fullFaceDescriptions: any;
  detectionInterval: any;

  constructor(private elRef: ElementRef) { }

  ngOnInit(): void {
    this.setUpData();

  }

  async setUpData() {
    await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
    await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
    await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
    await faceapi.nets.ssdMobilenetv1.loadFromUri('../../assets/models'),
    await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models'),]).then(() => this.startVideo());
  }

  startVideo() {
    this.videoInput = this.video.nativeElement;
    navigator.mediaDevices.getUserMedia({ video: {}, audio: false })
      .then((stream) => {
        this.videoInput.srcObject = stream;
      })
      .catch((err) => {
        console.log(err);
      });
    this.face_recog();
  }

  async detect_Faces() {
    this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
      this.canvas = await faceapi.createCanvasFromMedia(this.videoInput);
      this.canvasEl = this.canvasRef.nativeElement;
      this.canvasEl.appendChild(this.canvas);
      this.canvas.setAttribute('id', 'canvass');
      this.canvas.setAttribute(
        'style', `position: fixed;
        top: 76px;`
      );
      this.displaySize = {
        width: this.videoInput.width,
        height: this.videoInput.height,
      };
      faceapi.matchDimensions(this.canvas, this.displaySize);
      setInterval(async () => {
        this.detection = await faceapi.detectSingleFace(this.videoInput, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        console.log(this.detection);
        // this.resizedDetections = faceapi.resizeResults(
        //   this.detection,
        //   this.displaySize
        // );
        // this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        // faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
        // faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
        // faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
      }, 4000);
    });
  }

  async face_recog() {
    this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
      this.canvas = await faceapi.createCanvasFromMedia(this.videoInput);
      this.canvasEl = this.canvasRef.nativeElement;
      this.canvasEl.appendChild(this.canvas);
      this.canvas.setAttribute('id', 'canvass');
      this.canvas.setAttribute(
        'style', `position: fixed;
        top: 76px;`
      );
      this.displaySize = {
        width: this.videoInput.width,
        height: this.videoInput.height,
      };
      faceapi.matchDimensions(this.canvas, this.displaySize);
      const labeledFaceDescriptors = await this.detectHoangFace();
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.7);
      this.detectionInterval = setInterval(async () => {
        try {
          this.detection = await faceapi.detectSingleFace(this.videoInput, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptor();
          if (this.detection) {
            const bestMatch = faceMatcher.findBestMatch(this.detection.descriptor);
            this.resizedDetections = faceapi.resizeResults(
              this.detection,
              this.displaySize
            );
            this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
            const box = this.resizedDetections.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.label });
            drawBox.draw(this.canvas);
          }
        } catch (error) {
          console.log(error);
        }


        // this.resizedDetections = faceapi.resizeResults(
        //   this.detection,
        //   this.displaySize
        // );
        // this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        // faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
        // faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
        // faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
      }, 100);
    });
  }

  async detectHoangFace() {
    const label = "Hoang";
    const numberImage = 1;
    const descriptions = [];
    for (let i = 1; i <= numberImage; i++) {
      const img = await faceapi.fetchImage(
        `https://res.cloudinary.com/dudtu2qef/image/upload/v1710356042/DSC_0514_k5p6ud.jpg`
      );
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      descriptions.push(detection.descriptor);
    }
    return new faceapi.LabeledFaceDescriptors(label, descriptions);
  }

  ngOnDestroy(): void {
    clearInterval(this.detectionInterval);
  }
}
