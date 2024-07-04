import { Injectable , inject} from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';
import { GeneratedEntitty } from '../entity/upload.entity';
import moment, { Moment } from 'moment';
import { findIndex } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  protected readonly storage = inject(LocalStorageService);
  private sizeSubject = new BehaviorSubject<number>(0);
  $size = this.sizeSubject.asObservable();

  private LAST_MODIFIED_KEY = "";
  private ENTITIES_KEY = "";

  constructor() { }

  clear() {
    this.storage.clear()
  }

  init(uid: string) {
    this.LAST_MODIFIED_KEY = `${uid}_last_modified`;
    this.ENTITIES_KEY = `${uid}_entities`;
  }


  deleteEntity(id: string) {
    const entities = this.entities;
    const idx = findIndex(entities, { slug: id });
    entities.splice(idx, 1);
    this.entities = entities;
  }


  cacheEntity(entity: GeneratedEntitty) {
    const entities = this.entities;
    const idx = findIndex(entities, { slug: entity.slug });
    if (idx == -1) {
      entities.unshift(entity);
    } else {
      entities[idx] = entity;
    }
    this.entities = entities;
  }


  get lastModified(): Moment | null {
    return this.storage.get(this.LAST_MODIFIED_KEY);
  }

  set lastModified(value: Moment) {
    this.storage.set(this.LAST_MODIFIED_KEY, value);
  }


  get entities(): GeneratedEntitty[] {
    return this.storage.get(this.ENTITIES_KEY) || [];
  }

  set entities(value: GeneratedEntitty[]) {
    this.storage.set(this.ENTITIES_KEY, value);
    this.sizeSubject.next(value.length);
  }
}
