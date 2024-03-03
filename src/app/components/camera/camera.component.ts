import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
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

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule, WebcamModule, MatButtonModule, OptionsComponent, NgPipesModule, MatIconModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements OnInit {

  // toggle webcam on/off
  public mirrorImage = "never";
  public showWebcam = true;
  public allowCameraSwitch = false;
  public multipleWebcamsAvailable = false;
  public deviceId: string = "";
  public videoOptions: MediaTrackConstraints = {
    facingMode: "user"
  };
  public errors: WebcamInitError[] = [];
  public cameras: any = {};
  public width: number = 640;
  public $notloading = this.loader.$hidden;

  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  captured: WebcamImage | null = null;


  public constructor(
    private api: ApiService,
    private loader: LoaderService,
    private router: Router,
    private elementRef: ElementRef
  ) {

  }

  public ngOnInit(): void {
    const screenWidth = this.elementRef.nativeElement.clientWidth;
    this.width = screenWidth < 640 ? screenWidth : 640 ;
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

  public stopCamera(): void {
    this.showWebcam = false;
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

  public switchFacingMode(ev: MouseEvent) {
    ev.stopPropagation();
    setTimeout(() => this.stopCamera())
    const videoOptions = this.videoOptions;
    videoOptions.facingMode = videoOptions.facingMode === "user" ? "environment" : "user";
    this.videoOptions = videoOptions;
    setTimeout(() => this.startCamera());
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
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
}
