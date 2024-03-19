import { Component, OnInit } from '@angular/core';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OptionsComponent } from '../options/options.component';
import { LoaderService } from '../../service/loader.service';
import { ApiService } from '../../service/api.service';
import { Observable, Observer } from 'rxjs';



interface RouteDataEntity {
  data?: GeneratedEntitty;
}

@Component({
  selector: 'app-replay',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    OptionsComponent,
  ],
  templateUrl: './replay.component.html',
  styleUrl: './replay.component.scss'
})
export class ReplayComponent implements OnInit {

  data?: GeneratedEntitty | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loader: LoaderService,
    private api: ApiService,
    private router: Router
  ) {

  }


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        const entity = data.data as GeneratedEntitty;
        this.data = entity;
      },
    });
  }

  onSubmit(data: any) {
    this.loader.show();
    this.getBase64ImageFromURL(this.data?.source.raw_src || "").subscribe(
      (dataUrl: string) => {
        this.api.upload(dataUrl, data).subscribe({
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
    )

  }

  private getBase64ImageFromURL(url: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      let img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        observer.next(this.getBase64Image(img));
        observer.complete();
      };
      img.onerror = (err) => {
        observer.error(err);
      };
      img.src = url;

    });
  }

  private getBase64Image(img: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0);
    const dataURL: string = canvas.toDataURL("image/png");
    return dataURL;
  }


}
