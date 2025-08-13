import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil, WebcamModule } from 'ngx-webcam';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { MatButtonModule } from '@angular/material/button';
import { LoaderService } from '../../service/loader.service';
import { Router } from '@angular/router';
import { OptionsComponent } from '../options/options.component';
import { NgPipesModule } from 'ngx-pipes';
import { MatIconModule } from '@angular/material/icon';
import { FaceService } from '../../service/face.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatError } from '@angular/material/form-field';

interface Cameras {
  user: string[];
  environment: string[];
}

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule, WebcamModule, MatButtonModule, OptionsComponent, NgPipesModule, MatIconModule, MatSnackBarModule, MatError],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements OnInit {


  private hasCamerasSubject = new BehaviorSubject<boolean>(false);
  $hasCameras = this.hasCamerasSubject.asObservable();

  // toggle webcam on/off
  public mirrorImage = "never";
  public showWebcam = true;
  public allowCameraSwitch = false;
  public multipleWebcamsAvailable = false;
  public hasFaceCamera = false;
  public hasCameras = false;
  public deviceId: string = "";
  public videoOptions: MediaTrackConstraints = {};
  public errors: WebcamInitError[] = [];
  public cameras: Cameras = { user: [], environment: [] };

  public width: number = 640;
  public $notloading = this.loader.$hidden;

  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  private elementRef = inject(ElementRef);
  captured: WebcamImage | null = null;

  public constructor(
    private api: ApiService,
    private loader: LoaderService,
    private router: Router,

    private faceService: FaceService
  ) {

  }

  public ngOnInit(): void {
    const screenWidth = this.elementRef.nativeElement.clientWidth;
    this.width = screenWidth < 640 ? screenWidth : 640;
    this.loadCameras();
  }

  loadCameras(): void {
    WebcamUtil.getAvailableVideoInputs().then((mediaDevices: MediaDeviceInfo[]) => {
      this.cameras = mediaDevices.reduce((res: Cameras, camera) => {
        if (/front/i.test(camera.label)) {
          res.user.push(camera.deviceId);
        } else {
          res.environment.push(camera.deviceId);
        }
        return res;
      }, { user: [], environment: [] });
      if (this.cameras.user.length) {
        this.videoOptions.facingMode = "user";
        this.hasFaceCamera = true;
      }
      this.hasCamerasSubject.next(mediaDevices && mediaDevices.length > 0);
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    }).finally(() => {
      this.loader.hide();
    });
  }


  public reload(): void {
    this.loader.show();
    this.loadCameras();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public stopCamera(): void {
    this.showWebcam = false;
  }

  public startCamera(): void {
    this.captured = null;
    this.showWebcam = true;
    this.errors = [];
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public switchFacingMode(ev: MouseEvent) {
    ev.stopPropagation();
    const inUserMode = this.cameras.user.includes(this.deviceId);
    const cameras = inUserMode ? this.cameras.environment : this.cameras.user;
    this.videoOptions.facingMode = inUserMode ? "environment" : "user";
    const nextId = cameras[0] || true;
    this.nextWebcam.next(nextId);
    return true;
  }

  public showNextCamera(ev: MouseEvent) {
    ev.stopPropagation();
    this.hasFaceCamera && this.switchFacingMode(ev) || this.nextWebcam.next(true);
  }

  public handleImage(webcamImage: WebcamImage) {
    this.captured = webcamImage;
    this.loader.show();
    this.faceService.detectFaces(this.captured.imageAsDataUrl).then((det) => {
      if (!det.length) {
        this.errors.push({
          message: "No faces on this photo",
          mediaStreamError: (new DOMException())
        })
      }
    }).finally(() => {
      this.loader.hide();
    });
    this.showWebcam = false;
  }

  async onSubmit(data: any) {
    if (!this.captured || this.errors.length) {
      return;
    }
    const webcamImage = this.captured;
    this.loader.show();
    this.api.upload(webcamImage.imageAsDataUrl, data).subscribe({
      next: (resp: any) => {
        const response = resp as GeneratedEntitty;
        this.router.navigateByUrl(`/g/${response.slug}`).then(() => {
          this.loader.hide();
        });
      },
      error: (err: any) => {
        console.error(err);
        this.loader.hide();
      }
    })
  }



  public cameraWasSwitched(deviceId: string): void {
    console.debug('active device: ' + deviceId);
    const inUserMode = this.cameras.user.includes(deviceId);
    const cameras = inUserMode ? this.cameras.user : this.cameras.environment;
    cameras.push(cameras.shift() as string);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
}
