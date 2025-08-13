import { Component, OnInit } from '@angular/core';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OptionsComponent } from '../options/options.component';
import { LoaderService } from '../../service/loader.service';
import { ApiService } from '../../service/api.service';
import { Observable, Observer } from 'rxjs';
import { now } from 'lodash-es';



interface RouteDataEntity {
  data?: GeneratedEntitty;
}

@Component({
    selector: 'app-replay',
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
    const image_url = this.data?.source.raw_src || "";
    this.api.reUpload(Object.assign(data, { image_url })).subscribe({
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


}
