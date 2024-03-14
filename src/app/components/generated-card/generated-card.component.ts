import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeneratedEntitty, STATUS } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MomentModule } from 'ngx-moment';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ViewMode } from '../../entity/view.entity';
import { LoadingComponent } from '../loading/loading.component';
import { DatabaseService } from '../../service/database.service';
import { ApiService } from '../../service/api.service';
import { MatCardModule } from '@angular/material/card';
import { OverlayComponent } from '../overlay/overlay.component';
@Component({
  selector: 'app-generated-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MomentModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    LoadingComponent,
    OverlayComponent
  ],
  templateUrl: './generated-card.component.html',
  styleUrl: './generated-card.component.scss'
})
export class GeneratedCardComponent implements OnInit {

  @Input() data !: GeneratedEntitty;
  @Output() deleted = new EventEmitter<string>();

  mode: ViewMode = ViewMode.GENERATED;
  modes = ViewMode;
  statuses = STATUS;
  private overlay: any;

  constructor(
    private elementRef: ElementRef,
    private db: DatabaseService,
    private api: ApiService
  ) {

  }

  ngOnInit(): void {
    switch (this.data.status) {
      case STATUS.GENERATED:
        this.setBackground(this.data.image.raw_src);
        this.setMode(ViewMode.GENERATED);
        break;
      case STATUS.ERROR:
      case STATUS.IDLE:
        this.setBackground(this.data.source.raw_src);
        this.setMode(ViewMode.SOURCE);
        break;
      case STATUS.IN_PROGRESS:
      case STATUS.PENDING:
      case STATUS.STARTED:
        this.listen(this.data.uid, this.data.slug);
        this.setBackground(this.data.source.raw_src);
        this.setMode(ViewMode.SOURCE);
        break;
    }
  }

  private setBackground(src: string): void {
    this.elementRef.nativeElement.style.backgroundImage = `url('${src}')`;
  }


  onMode(ev: MouseEvent, mode: ViewMode) {
    ev.preventDefault();
    ev.stopPropagation();
    this.setMode(mode);
  }

  setMode(mode: ViewMode) {
    this.mode = mode;
    switch (mode) {
      case ViewMode.GENERATED:
        this.overlay && this.overlay.classList.remove("show")
        break;
      case ViewMode.SOURCE:
        this.overlay && this.overlay.classList.add("show")
        break;
    }
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
          this.data.status = obs as STATUS;
      }
    })
  }


  private reload(slug: string) {
    this.api.getGenerated(slug, true).subscribe({
      next: (data: any) => {
        const entity = data as GeneratedEntitty;
        this.data = data;
        this.ngOnInit();
      }
    })
  }


  onDelete(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.api.delete(this.data.slug).subscribe({
      next: (data) => {
        this.deleted.emit(this.data.slug);
      }, error: (err: any) => {
        console.error(err);
      },
      complete: () => { }
    });
  }
}