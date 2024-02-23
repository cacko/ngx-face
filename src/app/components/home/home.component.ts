import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { GeneratedCardComponent } from '../generated-card/generated-card.component';
import { chain, reject } from 'lodash-es';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

interface RouteDataEntity {
  data?: GeneratedEntitty[];
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule, GeneratedCardComponent],
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

  private infoSubject = new BehaviorSubject<string | null>(null);
  $info = this.infoSubject.asObservable();


  constructor(
    private activatedRoute: ActivatedRoute
  ) {

  }

  onDelete(ev: any) {
    const items = reject(this.dataSubject.value, { slug: ev });
    this.dataSubject.next(items);
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        const entity = data.data as GeneratedEntitty[];
        const items = chain(entity).filter({ deleted: false }).orderBy(['last_modified'], ['desc']).value();
        this.dataSubject.next(items);
        this.infoSubject.next(items.length ? null : "No history");
      },
    });
  }



}
