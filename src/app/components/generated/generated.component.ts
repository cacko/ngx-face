import { Component, HostListener, OnInit } from '@angular/core';
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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { OverlayComponent } from '../overlay/overlay.component';
import moment, { Moment } from 'moment';
import { ConfirmDirective } from '../../confirm.directive';

interface RouteDataEntity {
  data?: GeneratedEntitty;
}

@Component({
  selector: 'app-generated',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, MomentModule, MatIconModule, MatButtonModule, PromptComponent, OverlayComponent, MatSnackBarModule, ConfirmDirective],
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
  previousId: string | null = null;
  nextId: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private db: DatabaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        const entity = data.data as GeneratedEntitty;
        this.previousId = this.api.getPreviousId(entity);
        this.nextId = this.api.getNextId(entity);
        this.dataSubject.next(entity);
        console.log(entity);
        switch (entity.status) {
          case STATUS.GENERATED:
            this.setMode(ViewMode.GENERATED);
            break;
          case STATUS.ERROR:
            this.setMode(ViewMode.SOURCE);
            break;
          default:
            this.setMode(ViewMode.SOURCE);
            this.setScreenFit(ScreenFit.FIT_SCREEN);
            this.listen(entity.uid, entity.slug);
        }
      },
      error: (err: any) => {
        this.snackBar
          .open(err, 'Error', { duration: 5000 })
          .afterDismissed()
          .subscribe(() => this.router.navigateByUrl(`/`));
      }
    });
  }

  onMode(ev: MouseEvent) {
    ev.stopPropagation();
    this.setMode(this.mode == ViewMode.GENERATED ? ViewMode.SOURCE : ViewMode.GENERATED);
    return false;
  }

  onScreen(ev: MouseEvent) {
    ev.stopPropagation();
    this.setScreenFit(this.screen == ScreenFit.FIT_SCREEN ? ScreenFit.FULLSCREEN : ScreenFit.FIT_SCREEN);
    return false;
  }

  setMode(mode: ViewMode) {
    this.mode = mode;
  }

  setScreenFit(mode: ScreenFit) {
    this.screen = mode;
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

  onDownload(ev: MouseEvent) {
    ev.stopPropagation();
    const data = this.dataSubject.value as GeneratedEntitty;
    const suffix = this.mode == ViewMode.GENERATED ? 'generated' : 'source';
    const name = `${data.slug}-${suffix}`;
    const src = this.mode == ViewMode.GENERATED ? data.image.raw_src : data.source.raw_src;
    saveAs(src, `${name}.png`);
  }

  onReplay(ev: MouseEvent, slug: string) {
    ev.stopPropagation();
    this.router.navigateByUrl(`re/${slug}`);
  }

  onDelete() {
    const slug = this.dataSubject.value?.slug || "";
    this.api.delete(slug).subscribe({
      next: (data) => {
        this.home();
      }, error: (err: any) => {
        console.error(err);
      },
      complete: () => { }
    });
  }

  private listen(uid: string, slug: string) {
    const lst = this.db.listen(uid, slug).subscribe((obs) => {
      if (obs === null) {
        return;
      }
      switch (obs.status) {
        case STATUS.GENERATED:
        case STATUS.ERROR:
          setTimeout(() => {
            this.reload(slug, obs.last_modified);
            lst.unsubscribe();
          });
          break;
        default:
          setTimeout(() => this.reload(slug, obs.last_modified));
      }
    })
  }

  private reload(slug: string, last_modified: string) {
    this.api.getGenerated(slug, moment(last_modified).isSame(moment(this.dataSubject.value?.last_modified))).subscribe({
      next: (data: any) => {
        const entity = data as GeneratedEntitty;
        this.dataSubject.next(entity);
        switch (entity.status) {
          case STATUS.GENERATED:
            this.setMode(ViewMode.GENERATED);
            break;
          default:
            this.setMode(ViewMode.SOURCE);
            break;
        }
      }
    })
  }


  onNext(ev: MouseEvent) {
    ev.stopPropagation();
    return this.next();
  }

  onPrevious(ev: MouseEvent) {
    ev.stopPropagation();
    return this.previous();
  }

  private home() {
    return this.router.navigateByUrl("/");
  }

  private next() {
    return this.nextId && this.router.navigate(['/g', this.nextId], { state: { animation: "next" } });
  }

  private previous() {
    return this.previousId && this.router.navigate(['/g', this.previousId], { state: { animation: "previous" } });
  }

  @HostListener('window:keydown', ['$event'])
  keyNavigation(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        return this.previous();
      case 'ArrowRight':
        event.preventDefault();
        return this.next();
      default:
        return event;
    }
  }


}
