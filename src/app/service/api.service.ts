import { Injectable } from '@angular/core';
import { HttpRequest, HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { API } from '../entity/upload.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private uid: string = "dev"

  private readySubject = new Subject<boolean>();
  ready = this.readySubject.asObservable();

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


  upload(action: string, dataUrl: string, data: object = {}): Observable<HttpEvent<any>> {
    console.log(dataUrl);
    const formData: FormData = new FormData();
    const imageBlob = this.dataURLtoBlob(dataUrl);
    formData.append('file', imageBlob, `${uuidv4()}.png`);
    formData.append('data', JSON.stringify(data));

    const req = new HttpRequest('POST', `${API.URL}/${action}`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
}
