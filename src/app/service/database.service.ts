import { Injectable } from '@angular/core';
import { Database, objectVal, ref, stateChanges, DataSnapshot } from '@angular/fire/database';

import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { STATUS } from '../entity/upload.entity';


interface Listeners {
  [key: string]: BehaviorSubject<STATUS | null>;
}

interface Statuses {
  [key: string]: Observable<STATUS | null>;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  subs: Listeners = {};
  statuses: Statuses = {};
  private listLst ?: Subscription|null = null;

  constructor(
    private db: Database
  ) { }

  init(uid: string) {
    const path = `generation/${uid}`;
    const list = ref(this.db, path);
    this.listLst = stateChanges(list).subscribe((change: any) => {
      const snapshot: DataSnapshot = change.snapshot;
      const key = snapshot.key;
      const gPath = `${path}/${key}`;
      this.createListener(gPath);
      const result = snapshot.val().status;
      this.subs[gPath].next(result)
    })
  }

  deInit() {
    this.listLst?.unsubscribe();
    this.subs = {};
    this.statuses = {};
  }

  private createListener(path: string) {
    if (path in this.statuses) {
      return;
    }
    const sub = new BehaviorSubject<STATUS | null>(null);
    const obs = sub.asObservable();
    this.subs[path] = sub;
    this.statuses[path] = obs;
  }


  listen(uid: string, slug: string): Observable<STATUS | null> {
    const path = `generation/${uid}/${slug}`;
    this.createListener(path);
    return this.statuses[path];
  }

}
