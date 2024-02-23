import { Injectable } from '@angular/core';
import { Database, objectVal, ref } from '@angular/fire/database';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { STATUS } from '../entity/upload.entity';


interface Listeners {
  [key: string]: Subscription;
}

interface Statuses {
  [key: string]: Observable<STATUS|null>;
}


interface DbResponseEntity {
  status: STATUS
}


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  subs: Listeners = {};
  statuses: Statuses = {};

  constructor(
    private db: Database
  ) { }



  listen(uid:string, slug: string): Observable<STATUS|null> {
    const path = `generation/${uid}/${slug}`;
    if (path in this.statuses) {
      return this.statuses[path];
    }
    const doc = ref(this.db, path);
    const sub = new BehaviorSubject<STATUS|null>(null);
    const obs = sub.asObservable();
    this.statuses[path] = obs;
    const lst = objectVal(doc).subscribe({
      next: (data: any) => {
        const resp = data as DbResponseEntity;
        sub.next(resp.status);
        switch (resp.status) {
          case STATUS.GENERATED:
          case STATUS.ERROR:
            lst.unsubscribe();
            delete this.statuses[path];
            break;
          default:
            console.info(resp);
        }
      }
    });
    return this.statuses[path];
  }

}
