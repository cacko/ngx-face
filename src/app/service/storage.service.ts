import { Injectable , inject} from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';
import { GeneratedEntitty } from '../entity/upload.entity';
import moment, { Moment } from 'moment';
import { findIndex } from 'lodash-es';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  protected readonly storage = inject(LocalStorageService);


  constructor() { }

  clear() {
    this.storage.remove("last_modified");
    this.storage.remove("entities");
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
    return this.storage.get("last_modified");
  }

  set lastModified(value: Moment) {
    this.storage.set("last_modified", value);
  }


  get entities(): GeneratedEntitty[] {
    return this.storage.get("entities") || [];
  }

  set entities(value: GeneratedEntitty[]) {
    this.storage.set("entities", value);
  }

}
