import { Injectable } from '@angular/core';
import { Database, objectVal, ref } from '@angular/fire/database';

import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { STATUS } from '../entity/upload.entity';


interface Listeners {
  [key: string]: Subject<STATUS | null>;
}

interface Statuses {
  [key: string]: Observable<STATUS | null>;
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

  init(uid: string) {
    // const path = `generation/${uid}`;
    // const list = ref(this.db, path);
    // stateChanges(list).subscribe((change: any) => {
    //   const snapshot: DataSnapshot = change.snapshot;
    //   const key = snapshot.key;
    //   const gPath = `${path}/${key}`;
    //   if (gPath in this.subs) {
    //     this.subs[gPath].next(snapshot.val().status)
    //   }
    // })
  }


  listen(uid: string, slug: string): Observable<STATUS | null> {
    const path = `generation/${uid}/${slug}`;
    if (path in this.statuses) {
      return this.statuses[path];
    }
    const sub = new Subject<STATUS | null>();
    const obs = sub.asObservable();
    this.subs[path] = sub;
    this.statuses[path] = obs;
    const doc = ref(this.db, path);
    const lst = objectVal(doc).subscribe((data: any) => {
      const value = data as DbResponseEntity;
      const status = value.status as STATUS;
      sub.next(status);
      switch (status) {
        case STATUS.ERROR:
        case STATUS.GENERATED:
          lst.unsubscribe();
          delete this.subs[path];
          break;
      }
    });
    return this.statuses[path];
  }

}
