import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil, WebcamModule } from 'ngx-webcam';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { MatButtonModule } from '@angular/material/button';
import { LoaderService } from '../../service/loader.service';
import { Router } from '@angular/router';
import { OptionsComponent } from '../options/options.component';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule, WebcamModule, MatButtonModule, OptionsComponent],
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
    facingMode: "user"
  };
  public errors: WebcamInitError[] = [];
  public cameras: any = {};
  public width: number = 0;
  public $notloading = this.loader.$hidden;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  captured: WebcamImage|null = null;

  public constructor(
    private api: ApiService,
    private loader: LoaderService,
    private router: Router,
    private elementRef: ElementRef
  ) {

  }

  public ngOnInit(): void {
    this.width = this.elementRef.nativeElement.clientWidth;
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
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
    this.captured = null;
    this.showWebcam = true;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.captured = webcamImage;
    this.showWebcam = false;
  }

  onSubmit(data: any) {

    if (!this.captured) {
      return;
    }

    const webcamImage = this.captured;
    this.loader.show();
    this.api.upload(webcamImage.imageAsDataUrl, data).subscribe({
      next: (resp: any) => {
        const response = resp as GeneratedEntitty;
        console.log(response);
        this.router.navigateByUrl(`/g/${response.slug}`).then(() => {
          this.loader.hide();
        });
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
