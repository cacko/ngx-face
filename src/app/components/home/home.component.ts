import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatButtonModule } from '@angular/material/button';
import { GeneratedCardComponent } from '../generated-card/generated-card.component';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import moment from 'moment';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../../service/database.service';
import { ChangeEntity } from '../../entity/view.entity';
import { ListenEvent } from '@angular/fire/database';
import { ApiService } from '../../service/api.service';

interface RouteDataEntity {
  data?: GeneratedEntitty[];
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,
    MatButtonModule, RouterModule,
    GeneratedCardComponent, MatProgressBarModule, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    // the fade-in/fade-out animation.
    trigger('simpleFadeAnimation', [

      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),

      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [
        style({ opacity: 0 }),
        animate(200)
      ]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave',
        animate(400, style({ opacity: 0 })))
    ])
  ]
})
export class HomeComponent implements OnInit {

  private dataSubject = new BehaviorSubject<GeneratedEntitty[] | null>(null);
  $data = this.dataSubject.asObservable();

  constructor(
    private activatedRoute: ActivatedRoute,
    private db: DatabaseService,
    private api: ApiService
  ) {

  }

  onDelete(ev: any) {
    const items = this.dataSubject.value?.filter(v => v.slug != ev) || [];
    this.dataSubject.next(items);
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        const entity = data.data as GeneratedEntitty[];
        const items = entity.sort((a, b) => moment(a.last_modified).isAfter(moment(b.last_modified)) ? -1 : 1)
        this.dataSubject.next(items);
        this.db.$change.subscribe((change: ChangeEntity | null) => {
          switch (change?.event) {
            case ListenEvent.added:
              !this.exists(change.slug) && this.onAdded(change.slug);
              break;
            case ListenEvent.removed:
              this.exists(change.slug) && this.onRemoved(change.slug);
              break;
          }
        });
      },
    });
  }

  private exists(slug: string): boolean {
    return this.dataSubject.value?.map((it) => it.slug).includes(slug) || false;
  }

  private onAdded(slug: string) {
    this.api.getGenerated(slug).subscribe({
      next: (data: any) => {
        const item = data as GeneratedEntitty;
        const items = this.dataSubject.value || [];
        this.dataSubject.next([item].concat(items));
      },
      error: () => { }
    })
  }

  private onRemoved(slug: string) {
    this.onDelete(slug);
  }



}
