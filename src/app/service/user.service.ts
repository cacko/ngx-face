import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  authState,
  signInWithPopup,
  User,
  signOut,
  onIdTokenChanged
} from '@angular/fire/auth';
import { BehaviorSubject, EMPTY, Observable, of, Subscription, timer } from 'rxjs';
import moment from 'moment';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  public readonly user: Observable<User | null> = EMPTY;
  private refreshSub?: Subscription;
  public isLoggedIn = false;
  private isReady = false;
  private readySubject = new BehaviorSubject<boolean>(false);
  $ready = this.readySubject.asObservable();

  constructor(
    private auth: Auth = inject(Auth),
    private storage: StorageService
  ) {
    this.user = authState(this.auth);
  }



  init() {
    onIdTokenChanged(this.auth, (res) => {
      res?.getIdTokenResult().then((tokenResult) => {
        this.storage.token = tokenResult.token;
        const expiry = moment(tokenResult.expirationTime);
        const refresh = expiry.subtract(5 * 60, 'seconds')
        this.refreshSub && this.refreshSub?.unsubscribe();
        this.refreshSub = timer(refresh.toDate()).subscribe(() => {
          res.getIdToken(true);
        });
      });
    })
  }

  async login() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return await signInWithPopup(this.auth, provider);
  }

  async logout() {
    return await signOut(this.auth);
  }

}
