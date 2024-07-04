import { inject, Injectable } from '@angular/core';
import { Database, ref, stateChanges, DataSnapshot, objectVal} from '@angular/fire/database';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DbChangeEntity } from '../entity/upload.entity';
import { QueryChange, ListenEvent } from 'rxfire/database';
import { ChangeEntity, Options } from '../entity/view.entity';
import { concat } from 'lodash-es';


interface Listeners {
  [key: string]: BehaviorSubject<DbChangeEntity | null>;
}

interface Statuses {
  [key: string]: Observable<DbChangeEntity | null>;
}

interface AppData {
  options: Options;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  subs: Listeners = {};
  statuses: Statuses = {};
  private listLst?: Subscription | null = null;
  private optSafeLst?: Subscription | null = null;
  private optNSFWLst?: Subscription | null = null;


  private changeSubject = new BehaviorSubject<ChangeEntity | null>(null);
  $change = this.changeSubject.asObservable();

  private optionsSubject = new BehaviorSubject<Options>({
    models: [],
    templates: [],
  });
  options = this.optionsSubject.asObservable();

  constructor(
    private db: Database = inject(Database)
  ) { }

  init(uid: string) {
    const path = `generation/${uid}`;
    const listRef = ref(this.db, path);
    this.listLst = stateChanges(listRef).subscribe((change: QueryChange) => {
      const snapshot: DataSnapshot = change.snapshot;
      const key = snapshot.key as string;
      switch (change.event) {
        case ListenEvent.added:
        case ListenEvent.removed:
        case ListenEvent.changed:
          this.changeSubject.next({
            event: change.event,
            slug: key
          })
          break;
      }
      const gPath = `${path}/${key}`;
      this.createListener(gPath);
      this.subs[gPath].next(snapshot.val());
    });
    const safe_options = ref(this.db, "app/options/safe");
    this.optSafeLst = objectVal(safe_options).subscribe({
      next: (value: any) => {
        const data = value as Options;
        this.optionsSubject.next({
          models: concat(this.optionsSubject.value.models.filter(v => v.endsWith("*")), data.models),
          templates: concat(this.optionsSubject.value.templates.filter(v => v.endsWith("*")), data.templates)
        });
      }
    });
    const nsfw_options = ref(this.db, "app/options/nsfw");
    this.optNSFWLst = objectVal(nsfw_options).subscribe({
      next: (value: any) => {
        const data = value as Options;
        this.optionsSubject.next({
          models: concat(this.optionsSubject.value.models.filter(v => !v.endsWith("*")), data.models.map(v => `${v}*`)),
          templates: concat(this.optionsSubject.value.templates.filter(v => !v.endsWith("*")), data.templates.map(v => `${v}*`))
        });
      },
      error: (err: any) => { }
    });
  }

  deInit() {
    this.listLst?.unsubscribe();
    this.optSafeLst?.unsubscribe();
    this.optNSFWLst?.unsubscribe();
    this.subs = {};
    this.statuses = {};
  }

  private createListener(path: string) {
    if (path in this.statuses) {
      return;
    }
    const sub = new BehaviorSubject<DbChangeEntity | null>(null);
    const obs = sub.asObservable();
    this.subs[path] = sub;
    this.statuses[path] = obs;
  }


  listen(uid: string, slug: string): Observable<DbChangeEntity | null> {
    const path = `generation/${uid}/${slug}`;
    this.createListener(path);
    return this.statuses[path];
  }

}
