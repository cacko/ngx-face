import { Component, OnInit } from '@angular/core';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OptionsComponent } from '../options/options.component';
import { LoaderService } from '../../service/loader.service';
import { ApiService } from '../../service/api.service';
import { concatMap } from 'rxjs';

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
  styleUrl: './replay.component.scss',
})
export class ReplayComponent implements OnInit {
  data?: GeneratedEntitty | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loader: LoaderService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(
        concatMap((params) => this.api.getGenerated(params.get('id') || ''))
      )
      .subscribe({
        next: (data: GeneratedEntitty) => {
          const entity = data as GeneratedEntitty;
          this.data = entity;
        },
      });
  }

  onSubmit(data: any) {
    this.loader.show();
    const image_url = this.data?.source.raw_src || '';
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
      },
    });
  }
}
