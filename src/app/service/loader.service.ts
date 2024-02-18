import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private visibleSubject = new BehaviorSubject<boolean>(true);
  $visible = this.visibleSubject.asObservable();

  constructor() { }

  show() {
    this.visibleSubject.next(true);
  }

  hide() {
    this.visibleSubject.next(false);
  }

}
