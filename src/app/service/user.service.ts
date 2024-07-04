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
import { EMPTY, Observable, Subscription, timer } from 'rxjs';
import { ApiService } from './api.service';
import moment from 'moment';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  public readonly user: Observable<User | null> = EMPTY;
  private refreshSub?: Subscription;

  constructor(
    private auth: Auth = inject(Auth),
    private api: ApiService
  ) {
    this.user = authState(this.auth);
  }

  init() {
    onIdTokenChanged(this.auth, (res) => {
      res?.getIdTokenResult().then((tokenResult) => {
        this.api.userToken = tokenResult.token;
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
