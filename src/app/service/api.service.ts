import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { API, GeneratedEntitty } from '../entity/upload.entity';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { Options } from '../entity/view.entity';


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

  userToken = '';

  constructor(
    private http: HttpClient
  ) { }

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
    });
  }

  getGenerated(id: string): any {
    return this.http.get(`${API.URL}/${API.ACTION_GENERATED}/${id}`, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  getGenerations(): any {
    return this.http.get(`${API.URL}/${API.ACTION_GENERATED}`, {
      headers: this.headers,
      withCredentials: true,
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

