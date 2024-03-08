import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GeneratedEntitty, STATUS } from '../../entity/upload.entity';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../service/api.service';
import { LoadingComponent } from '../loading/loading.component';
import { DatabaseService } from '../../service/database.service';
import { PromptEntity, ScreenFit, ViewMode } from '../../entity/view.entity';
import { MomentModule } from 'ngx-moment';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PromptComponent } from '../prompt/prompt.component';
import { saveAs } from 'file-saver';
import { OverlayComponent } from '../overlay/overlay.component';

interface RouteDataEntity {
  data?: GeneratedEntitty;
}

@Component({
  selector: 'app-generated',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, MomentModule, MatIconModule, MatButtonModule, PromptComponent, OverlayComponent],
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
  prompt?: PromptEntity | null = null;
  private overlay: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private db: DatabaseService,
    private elementRef: ElementRef,
    private router: Router
  ) { }


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        const entity = data.data as GeneratedEntitty;
        this.dataSubject.next(entity);
        switch (entity.status) {
          case STATUS.GENERATED:
            this.setMode(ViewMode.GENERATED);
            this.setBackground(this.dataSubject.value?.image.raw_src || "");
            break;
          case STATUS.ERROR:
            this.setMode(ViewMode.SOURCE);
            this.setBackground(this.dataSubject.value?.source.raw_src || "");
            break;
          default:
            this.setMode(ViewMode.SOURCE);
            this.setBackground(this.dataSubject.value?.source.raw_src || "");
            this.listen(entity.uid, entity.slug);
        }
      },
    });
  }

  private setBackground(src: string): void {
    this.elementRef.nativeElement.style.backgroundImage = `url('${src}')`;
  }

  onMode(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.setMode(this.mode == ViewMode.GENERATED ? ViewMode.SOURCE : ViewMode.GENERATED);
    return false;
  }

  onScreen(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.setScreenFit(this.screen == ScreenFit.FIT_SCREEN ? ScreenFit.FULLSCREEN : ScreenFit.FIT_SCREEN);
    return false;
  }

  toggleFit(ev: MouseEvent) {
    ev.stopPropagation();
    this.setScreenFit(this.screen == ScreenFit.FIT_SCREEN ? ScreenFit.FULLSCREEN : ScreenFit.FIT_SCREEN);
  }

  setMode(mode: ViewMode) {
    this.mode = mode;
  }

  setScreenFit(mode: ScreenFit) {
    this.screen = mode;
    switch (mode) {
      case ScreenFit.FIT_SCREEN:
        this.elementRef.nativeElement.toggleAttribute("real-size", true);
        break;
      case ScreenFit.FULLSCREEN:
        this.elementRef.nativeElement.toggleAttribute("real-size", false);
        break;
    }
  }

  onDelete(ev: any) {

  }

  onPrompt(ev: MouseEvent) {
    ev.stopPropagation();
    if (this.prompt) {
      this.prompt = null;
      return;
    }
    const prompt = this.dataSubject.value?.prompt as PromptEntity;
    this.prompt = prompt;
  }

  onDownload(ev: MouseEvent, src: string, name: string) {
    ev.stopPropagation();
    saveAs(src, `${name}.png`);
  }

  onReplay(ev: MouseEvent, slug: string) {
    ev.stopPropagation();
    this.router.navigateByUrl(`re/${slug}`);
  }

  private listen(uid: string, slug: string) {
    const lst = this.db.listen(uid, slug).subscribe((obs) => {
      if (obs === null) {
        return;
      }
      switch (obs) {
        case STATUS.GENERATED:
        case STATUS.ERROR:
          setTimeout(() => {
            this.reload(slug);
            lst.unsubscribe();
          });
          break;
        default:
          setTimeout(() => this.reload(slug));
      }
    })
  }

  private reload(slug: string) {
    this.api.getGenerated(slug).subscribe({
      next: (data: any) => {
        const entity = data as GeneratedEntitty;
        this.dataSubject.next(entity);
        switch (entity.status) {
          case STATUS.GENERATED:
            this.setBackground(entity.image.raw_src || "");
            this.setMode(ViewMode.GENERATED);
            break;
          default:
            this.setMode(ViewMode.SOURCE);
            break;
        }
      }
    })
  }

}
