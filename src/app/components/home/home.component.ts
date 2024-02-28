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
    private activatedRoute: ActivatedRoute
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
        const items = entity.filter(d => !d.deleted).sort((a, b) => moment(a.last_modified).isAfter(moment(b.last_modified)) ? -1 : 1)
        this.dataSubject.next(items);
      },
    });
  }



}
