import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as faceapi from '@vladmandic/face-api';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements OnInit, OnDestroy {
  WIDTH = 730;
  HEIGHT = 600;

  @ViewChild('video', { static: true })
  public video: ElementRef;
  @ViewChild('canvas', { static: true })
  public canvasRef: ElementRef;
  @ViewChild('canvasImage', { static: true })
  public canvascanvasImageRef: HTMLCanvasElement;

  @Input() isOpenCamera: boolean = false;
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

  constructor(private elRef: ElementRef) { }

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
      this.detectFaces();
    }
  }

  async detectFaces() {
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
      setInterval(async () => {
        this.detection = await faceapi.detectSingleFace(this.videoInput, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions();
        if (this.detection) {
          this.resizedDetections = faceapi.resizeResults(
            this.detection,
            this.displaySize
          );
          this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
          faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
          // faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
          faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
        }
      }, 300);
    });
  }

  async captureImages() {
    var interations = 0;
    const canvasImage = this.canvascanvasImageRef || (this.canvascanvasImageRef = document.createElement('canvas'));
    canvasImage.width = this.videoInput.width;
    canvasImage.height = this.videoInput.height;

    this.captureInterval = setInterval(async () => {
      try {
        interations++;
        this.canvas
          .getContext("2d")
          .drawImage(this.videoInput, 0, 0, this.videoInput.width, this.videoInput.height);
        // Convert canvas data to a Blob
        this.canvas.toBlob(blob => {
          // Create a new File object
          const file = new File([blob], `${interations}.png`, { type: 'image/jpg' });
          // Save the file to a directory (outside of Angular project directory)
          saveAs(file);

          // captureFrame(); // Recursively call to capture next frame
        }, 'image/png');
        if (interations == 10) {
          clearInterval(this.captureInterval);
          this.finishCapturing.emit();
        } 
      } catch (error) {
        console.log(error);
      }
    }, 500);
  }

  // async face_recog() {
  //   this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
  //     this.canvas = faceapi.createCanvasFromMedia(this.videoInput);
  //     this.canvasEl = this.canvasRef.nativeElement;
  //     this.canvasEl.appendChild(this.canvas);
  //     this.canvas.setAttribute('id', 'canvass');
  //     this.canvas.setAttribute(
  //       'style', `position: fixed;
  //       top: 76px;`
  //     );
  //     this.displaySize = {
  //       width: this.videoInput.width,
  //       height: this.videoInput.height,
  //     };
  //     faceapi.matchDimensions(this.canvas, this.displaySize);
  //     const labeledFaceDescriptors = await this.getLabeledFaceDescriptors();
  //     const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.7);
  //     console.log(labeledFaceDescriptors);
  //     this.detectionInterval = setInterval(async () => {
  //       try {
  //         var detectionRes = await faceapi.detectSingleFace(this.videoInput, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.75, maxResults: 1 })).withFaceLandmarks().withFaceDescriptor();
  //         if (detectionRes) {
  //           const bestMatch = faceMatcher.findBestMatch(detectionRes.descriptor);
  //           this.resizedDetections = faceapi.resizeResults(
  //             detectionRes,
  //             this.displaySize
  //           );
  //           this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
  //           const box = this.resizedDetections.detection.box;
  //           const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() });
  //           if (this.isOpenCamera == true && this.isOpenCamera !== undefined) drawBox.draw(this.canvas);
  //           // const resizedDetections = faceapi.resizeResults(detectionRes, this.displaySize);
  //           // const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
  //           // this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
  //           // results.forEach((result, i) => {
  //           //   const box = resizedDetections[i].detection.box
  //           //   const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
  //           //   drawBox.draw(this.canvas)
  //           // })
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }, 100);
  //   });
  // }

  // async getLabeledFaceDescriptors() {
  //   // const labels = ["Hoang", "Luong"];
  //   const labels = [ "HoangTa"];
  //   return Promise.all(
  //     labels.map(async label => {
  //       const descriptions = []
  //       for (let i = 1; i <= 10; i++) {
  //         const img = await faceapi.fetchImage(`./assets/labeled_images/${label}/${i}.png`)
  //         const detections = await faceapi.detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.75, maxResults: 1 })).withFaceLandmarks().withFaceDescriptor()
  //         descriptions.push(detections.descriptor)
  //       }
  //       return new faceapi.LabeledFaceDescriptors(label, descriptions)
  //     })
  //   )
  // }

  // changeCameraState() {
  //   if (!this.isOpenCamera) {
  //     this.isOpenCamera = true;
  //     navigator.mediaDevices.getUserMedia({ video: {}, audio: false })
  //       .then((stream) => {
  //         this.videoInput.srcObject = stream;
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //     this.face_recog();
  //   } else {
  //     this.isOpenCamera = false;
  //     clearInterval(this.detectionInterval)
  //     this.canvas.getContext('2d').context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  //     this.videoInput.srcObject = null;
  //   }
  // }

  // async trainImageModel() {
  //   this.isOpenCamera = true;
  //   this.isCollectingImages = true
  //   navigator.mediaDevices.getUserMedia({ video: {}, audio: false })
  //     .then((stream) => {
  //       this.videoInput.srcObject = stream;
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  //   // await this.capture_images();
  //   this.isOpenCamera = false;
  //   // clearInterval(this.detectionInterval)
  //   this.canvas?.getContext('2d').context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  //   this.videoInput.srcObject = null;
  // }

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

  // saveImage(file: File) {
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const base64data = reader.result.toString().split(',')[1]; // Extract base64 data

  //     // Convert base64 data to binary
  //     const binaryData = Buffer.from(base64data, 'base64');

  //     // Define the file path where you want to save the image
  //     const filePath = join(__dirname, 'assets', 'labeled_images', 'HoangTa', file.name);

  //     // Write the binary data to the file
  //     writeFile(filePath, binaryData, (err) => {
  //       if (err) {
  //         console.error('Error saving image:', err);
  //       } else {
  //         console.log('Image saved successfully');
  //       }
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // }
}
