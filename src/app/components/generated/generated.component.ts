import { Component, OnInit } from '@angular/core';
import { GeneratedEntitty, STATUS } from '../../entity/upload.entity';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../service/api.service';
import { LoadingComponent } from '../loading/loading.component';
import { DatabaseService } from '../../service/database.service';

interface RouteDataEntity {
  data?: GeneratedEntitty;
}

@Component({
  selector: 'app-generated',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './generated.component.html',
  styleUrl: './generated.component.scss'
})
export class GeneratedComponent implements OnInit {

  private dataSubject = new BehaviorSubject<GeneratedEntitty | null>(null);
  $data = this.dataSubject.asObservable();
  loading = false;
  status = STATUS;

  constructor(
    private activatedRoute: ActivatedRoute,
    private api: ApiService,
    private db: DatabaseService
  ) { }


  ngOnInit() {
    this.activatedRoute.data.subscribe({
      next: (data: RouteDataEntity) => {
        console.log(data);
        const entity = data.data as GeneratedEntitty;
        switch (entity.status) {
          case STATUS.GENERATED:
            break;
          case STATUS.IN_PROGRESS:
          case STATUS.PENDING:
          case STATUS.STARTED:
            this.listen(entity.uid, entity.slug);
            this.loading = true;
        }
        this.dataSubject.next(entity);
      },
    });
  }

  private listen(uid: string, slug: string) {
    const lst = this.db.listen(uid, slug).subscribe((obs) => {
      switch (obs) {
        case STATUS.GENERATED:
        case STATUS.ERROR:
          this.reload(slug);
          lst.unsubscribe();
          this.loading = false;
      }
    })
  }


  private reload(slug: string) {
    this.api.getGenerated(slug).subscribe({
      next: (data: any) => {
        console.log(data);
        const entity = data as GeneratedEntitty;
        this.dataSubject.next(entity);
      }
    })
  }

}
