import { Component, ElementRef, OnInit } from '@angular/core';
import { GeneratedEntitty, STATUS } from '../../entity/upload.entity';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../service/api.service';
import { LoadingComponent } from '../loading/loading.component';
import { DatabaseService } from '../../service/database.service';
import { ScreenFit, ViewMode } from '../../entity/view.entity';
import { MomentModule } from 'ngx-moment';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScreenTrackingService } from '@angular/fire/analytics';

interface RouteDataEntity {
  data?: GeneratedEntitty;
}

@Component({
  selector: 'app-generated',
  standalone: true,
  imports: [CommonModule, LoadingComponent, MomentModule, MatIconModule, MatButtonModule],
  templateUrl: './generated.component.html',
  styleUrl: './generated.component.scss'
})
export class GeneratedComponent implements OnInit {

  private dataSubject = new BehaviorSubject<GeneratedEntitty | null>(null);
  $data = this.dataSubject.asObservable();
  loading = false;
  status = STATUS;
  mode: ViewMode = ViewMode.GENERATED;
  modes = ViewMode;
  screen: ScreenFit = ScreenFit.FULLSCREEN;
  screens = ScreenFit;

  constructor(
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private db: DatabaseService,
    private elementRef: ElementRef
  ) { }


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        const entity = data.data as GeneratedEntitty;
        this.dataSubject.next(entity);
        switch (entity.status) {
          case STATUS.GENERATED:
            this.setMode(ViewMode.GENERATED)
            break;
          case STATUS.ERROR:
            this.setMode(ViewMode.SOURCE);
            break;
          case STATUS.IN_PROGRESS:
          case STATUS.PENDING:
          case STATUS.STARTED:
            this.setMode(ViewMode.SOURCE);
            this.listen(entity.uid, entity.slug);
            this.loading = true;
        }
      },
    });
  }

  private setBackground(src: string): void {
    this.elementRef.nativeElement.style.backgroundImage = `url('${src}')`;
  }

  onMode(ev: MouseEvent, mode: ViewMode) {
    ev.stopPropagation();
    this.setMode(mode);
  }

  onScreen(ev: MouseEvent, mode: ScreenFit) {
    ev.stopPropagation();
    this.setScreenFit(mode);
  }

  toggleFit(ev: MouseEvent) {
    ev.stopPropagation();
    this.setScreenFit(this.screen == ScreenFit.FIT_SCREEN ? ScreenFit.FULLSCREEN : ScreenFit.FIT_SCREEN);
  }

  setMode(mode: ViewMode) {
    this.mode = mode;
    switch (mode) {
      case ViewMode.GENERATED:
        this.setBackground(this.dataSubject.value?.image.raw_src || "");
        break;
      case ViewMode.SOURCE:
        this.setBackground(this.dataSubject.value?.source.raw_src || "");
        break;
    }
  }

  setScreenFit(mode: ScreenFit) {
    this.screen = mode;
    switch (mode) {
      case ScreenFit.FIT_SCREEN:
        this.elementRef.nativeElement.classList.add("real-size");
        break;
      case ScreenFit.FULLSCREEN:
        this.elementRef.nativeElement.classList.remove("real-size");
        break;
    }
  }

  onDelete(ev: any) {

  }

  private listen(uid: string, slug: string) {
    const lst = this.db.listen(uid, slug).subscribe((obs) => {
      switch (obs) {
        case STATUS.GENERATED:
        case STATUS.ERROR:
          this.reload(slug);
          lst.unsubscribe();
          this.loading = false;
      }
    })
  }


  private reload(slug: string) {
    this.api.getGenerated(slug).subscribe({
      next: (data: any) => {
        const entity = data as GeneratedEntitty;
        this.dataSubject.next(entity);
        this.setMode(entity.status == STATUS.GENERATED ? ViewMode.GENERATED : ViewMode.SOURCE);
      }
    })
  }

}
