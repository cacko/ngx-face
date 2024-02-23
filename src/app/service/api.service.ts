import { Injectable } from '@angular/core';
import { HttpRequest, HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { API, GeneratedEntitty } from '../entity/upload.entity';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';

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

  uploadForm(file: File, data: object = {}): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);
    formData.append('data', JSON.stringify(data));

    const req = new HttpRequest('POST', `${API.URL}/${API.ACTION_GENERATE}`, formData, {
      reportProgress: true,
      responseType: 'json',
      headers: this.headers
    });

    return this.http.request(req);
  }
  upload(dataUrl: string, data: object = {}): Observable<HttpEvent<any>> {
    console.log(dataUrl);
    const formData: FormData = new FormData();
    const imageBlob = this.dataURLtoBlob(dataUrl);
    formData.append('file', imageBlob, `${uuidv4()}.png`);
    formData.append('data', JSON.stringify(data));

    const req = new HttpRequest('POST', `${API.URL}/${API.ACTION_GENERATE}`, formData, {
      reportProgress: true,
      responseType: 'json',
      headers: this.headers
    });

    return this.http.request(req);
  }

  getGenerated(id: string): any {
    return this.http.get(`${API.URL}/${API.ACTION_GENERATED}/${id}`, {
      headers: this.headers
    });
  }

  getGenerations(): any {
    return this.http.get(`${API.URL}/${API.ACTION_GENERATED}`, {
      headers: this.headers
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

