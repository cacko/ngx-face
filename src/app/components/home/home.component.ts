import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


interface RouteDataEntity {
  data?: GeneratedEntitty[];
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  private dataSubject = new BehaviorSubject<GeneratedEntitty[] | null>(null);
  $data = this.dataSubject.asObservable();



  constructor(
    private activatedRoute: ActivatedRoute
  ) { }


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        console.log(data);
        const entity = data.data as GeneratedEntitty[];
        this.dataSubject.next(entity);
      },
    });
  }



}
