import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseError } from '@angular/fire/app';
import { LoaderService } from '../../service/loader.service';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

enum LOGIN_MODE {
  PASSWORD = 'password',
  MAGIC = 'magic',
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [CommonModule, MatIconModule, MatCardModule],
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private redirectTo: string = '/';
  errorMessage: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public user: UserService,
    private loader: LoaderService
  ) {
  }

  login($event: any) {
    this.loader.show();
    this.user
      .login()
      .then((user) => {
        this.router.navigateByUrl(this.redirectTo);
      })
      .catch((err: FirebaseError) => {
        this.errorMessage = err.message;
      });
  }

  ngOnInit(): void {
    this.loader.hide();
    this.activatedRoute.queryParams.subscribe((qp: any) => {
      this.redirectTo = qp.redirectTo || '/';
      return;
    });
  }

  logout() {
    this.user.logout();
  }

}