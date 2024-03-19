import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, tap, delay, EMPTY, expand, reduce } from 'rxjs';
import { API, GeneratedEntitty } from '../entity/upload.entity';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { concat, findIndex } from 'lodash-es';
import { LocalStorageService } from 'ngx-localstorage';
import moment, { Moment } from 'moment';
import { LoaderService } from './loader.service';


// const URL = 'https://api.punkapi.com/v2/beers';@Injectable({
//   providedIn: 'root'
// })
// export class HttpService {
//   public responseCache = new Map();constructor(private http: HttpClient) {}public getBeerList(): Observable<any> {
//     const beersFromCache = this.responseCache.get(URL);
//     if (beersFromCache) {
//       return of(beersFromCache);
//     }
//     const response = this.http.get<any>(URL);
//     response.subscribe(beers => this.responseCache.set(URL, beers));
//     return response;
//   }
// }

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private uid: string = "dev"

  private readySubject = new Subject<boolean>();
  ready = this.readySubject.asObservable();
  protected readonly storage = inject(LocalStorageService);

  userToken = '';

  constructor(
    private http: HttpClient,
    private loader: LoaderService
  ) {
    this.storage.remove("last_modified");
    this.storage.remove("entities");
  }

  private dataURLtoBlob(dataurl: string) {
    var arr = dataurl.split(','), mime = 'image/png',
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }


  get headers(): HttpHeaders {
    return new HttpHeaders({
      "X-User-Token": this.userToken
    });
  }

  uploadForm(file: File, data: object = {}): Observable<Object> {
    const formData: FormData = new FormData();

    formData.append('file', file);
    formData.append('data', JSON.stringify(data));

    return this.http.post(`${API.URL}/${API.ACTION_GENERATE}`, formData, {
      headers: this.headers
    });

  }
  upload(dataUrl: string, data: object = {}): Observable<Object> {
    const formData: FormData = new FormData();
    const imageBlob = this.dataURLtoBlob(dataUrl);
    formData.append('file', imageBlob, `${uuidv4()}.png`);
    formData.append('data', JSON.stringify(data));
    return this.http.post(`${API.URL}/${API.ACTION_GENERATE}`, formData, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  delete(id: string): Observable<Object> {
    return this.http.delete(`${API.URL}/${API.ACTION_GENERATED}/${id}`, {
      headers: this.headers,
      withCredentials: true,
    }).pipe(tap(() => {
      const entities = this.entities;
      const idx = findIndex(entities, { slug: id });
      entities.splice(idx, 1);
      this.entities = entities;
    }));
  }

  private get lastModified(): Moment | null {
    return this.storage.get("last_modified");
  }

  private set lastModified(value: Moment) {
    this.storage.set("last_modified", value);
  }

  private get entities(): GeneratedEntitty[] {
    return this.storage.get("entities") || [];
  }

  private set entities(value: GeneratedEntitty[]) {
    this.storage.set("entities", value);
  }

  getGenerated(id: string, useCache: boolean = true): any {
    return new Observable((subscriber: any) => {
      const entities = this.entities;
      const idx = findIndex(entities, { slug: id });
      if (idx > -1 && useCache) {
        subscriber.next(entities[idx]);
        return;
      }
      this.loader.show();
      this.http.get(`${API.URL}/${API.ACTION_GENERATED}/${id}`, {
        headers: this.headers,
        withCredentials: true,
      }).subscribe({
        next: (data: any) => {
          if (idx === -1) {
            entities.unshift(data);
          } else {
            entities[idx] = data;
          }
          this.entities = entities;
        },
        error: (error: any) => console.debug(error),
        complete: () => {
          subscriber.next(this.entities);
          this.loader.hide();
        },
      });
    });
  }

  getGenerations(): any {
    return new Observable((subscriber: any) => {
      let lastModified = this.lastModified;
      if (lastModified) {
        subscriber.next(this.entities);
        return;
      }
      lastModified = moment.unix(0).utc();
      this.http.get(`${API.URL}/${API.ACTION_GENERATED}`, {
        headers: this.headers,
        withCredentials: true,
        observe: 'response',
        params: { limit: 10, last_modified: lastModified.format() }
      }).pipe(
        expand((res) => {
          const nextPage = res.headers.get('x-pagination-next');
          const pageNo = parseInt(String(res.headers.get('x-pagination-page')));
          return nextPage
            ? this.http.get(nextPage, {
              headers: { 'X-User-Token': this.userToken },
              observe: 'response',
            }).pipe(delay(100))
            : EMPTY;
        }),
        reduce((acc, current): any => {
          const data = current.body as GeneratedEntitty[];
          const pageNo = parseInt(String(current.headers.get('x-pagination-page')));
          return concat(acc, data);
        }, []),
        tap((res) => {
          this.entities = res;
          this.lastModified = moment().utc();
        })).subscribe({
          next: (data: any) => {
            subscriber.next(data);
          },
          error: (error: any) => console.debug(error),
        });
    });
  }
}


export const generatedResolver: ResolveFn<GeneratedEntitty> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const id = route.paramMap.get('id')!;
  return inject(ApiService).getGenerated(id);
};

export const generationsResolver: ResolveFn<GeneratedEntitty[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(ApiService).getGenerations();
};

