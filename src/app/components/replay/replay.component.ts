import { Component, OnInit } from '@angular/core';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



interface RouteDataEntity {
  data?: GeneratedEntitty;
}

@Component({
  selector: 'app-replay',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  templateUrl: './replay.component.html',
  styleUrl: './replay.component.scss'
})
export class ReplayComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,

  ) {

  }


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        const entity = data.data as GeneratedEntitty;
      },
    });
  }


}
