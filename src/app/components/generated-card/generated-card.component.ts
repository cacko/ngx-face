import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { GeneratedEntitty, STATUS } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MomentModule } from 'ngx-moment';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ViewMode } from '../../entity/view.entity';
import { LoadingComponent } from '../loading/loading.component';
@Component({
  selector: 'app-generated-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MomentModule, MatButtonModule, MatIconModule, LoadingComponent],
  templateUrl: './generated-card.component.html',
  styleUrl: './generated-card.component.scss'
})
export class GeneratedCardComponent implements OnInit {

  @Input() data !: GeneratedEntitty;

  mode: ViewMode = ViewMode.GENERATED;
  modes = ViewMode;
  statuses = STATUS;
  loading = false;

  constructor(private elementRef: ElementRef) {

  }

  ngOnInit(): void {
    switch (this.data.status) {
      case STATUS.GENERATED:
        this.setMode(ViewMode.GENERATED);
        break;
      case STATUS.ERROR:
      case STATUS.IDLE:
        this.setMode(ViewMode.SOURCE);
        break;
      case STATUS.IN_PROGRESS:
      case STATUS.PENDING:
      case STATUS.STARTED:
        this.loading = true;
        this.setMode(ViewMode.SOURCE);
        break;
    }
  }

  private setBackground(src: string): void {
    this.elementRef.nativeElement.style.backgroundImage = `url('${src}')`;
  }

  onMode(ev: MouseEvent, mode: ViewMode) {
    ev.stopPropagation();
    this.setMode(mode);
  }
  setMode(mode: ViewMode) {
    this.mode = mode;
    switch (mode) {
      case ViewMode.GENERATED:
        this.setBackground(this.data.image.raw_src);
        break;
      case ViewMode.SOURCE:
        this.setBackground(this.data.source.raw_src);
        break;
    }
  }

  onDelete(ev: MouseEvent) {
    ev.stopPropagation();
  }
}