import { Component, Input, OnInit } from '@angular/core';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';


interface RouteDataEntity {
  data?: GeneratedEntitty;
}

@Component({
  selector: 'app-generated',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generated.component.html',
  styleUrl: './generated.component.scss'
})
export class GeneratedComponent implements OnInit {

  private dataSubject = new BehaviorSubject<GeneratedEntitty|null>(null);
  $data = this.dataSubject.asObservable();

  constructor(
    private activatedRoute: ActivatedRoute
  )
  {}


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        console.log(data);
        const entity = data.data as GeneratedEntitty;
        this.dataSubject.next(entity);
      },
    });
  }


}
