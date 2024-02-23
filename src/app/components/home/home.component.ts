import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { GeneratedCardComponent } from '../generated-card/generated-card.component';


interface RouteDataEntity {
  data?: GeneratedEntitty[];
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule, GeneratedCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
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


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        console.log(data);
        const entity = data.data as GeneratedEntitty[];
        this.dataSubject.next(entity);
        this.infoSubject.next(entity.length ? null : "No history");
      },
    });
  }



}
