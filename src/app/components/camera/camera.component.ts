import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil, WebcamModule } from 'ngx-webcam';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { API, GeneratedEntitty } from '../../entity/upload.entity';
import { HttpEventType } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { LoaderService } from '../../service/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule, WebcamModule, MatButtonModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements OnInit {

  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string = "";
  public videoOptions: MediaTrackConstraints = {
    width: { ideal: 1024 },
    height: { ideal: 576 },
    facingMode: "user"
  };
  public errors: WebcamInitError[] = [];
  public cameras: any = {};

  public $notloading = this.loader.$hidden;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  public constructor(
    private api: ApiService,
    private loader: LoaderService,
    private router: Router
  ) {

  }

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        console.log(mediaDevices);
        this.cameras = mediaDevices;
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public startCamera(): void {
    this.showWebcam = true;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.loader.show();
    this.showWebcam = false;
    this.api.upload(webcamImage.imageAsDataUrl).subscribe({
      next: (event: any) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            break;
          case HttpEventType.Response:
            const response = event.body as GeneratedEntitty;
            this.loader.hide();
            this.router.navigateByUrl(`/g/${response.slug}`);
            break;
        }
      },
      error: (err: any) => {
        console.log(err);
        this.loader.hide();
      }
    })
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
}
