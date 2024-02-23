import { Component, OnInit, isDevMode } from '@angular/core';
import { Event, EventType, Router, RouterModule, RouterOutlet } from '@angular/router';
import { CameraComponent } from './components/camera/camera.component';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { LoaderService } from './service/loader.service';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';
import { UserService } from './service/user.service';
import { User } from '@angular/fire/auth';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgPipesModule } from 'ngx-pipes';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    CameraComponent,
    CommonModule,
    LoaderComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    NgPipesModule,
    RouterModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'facision';
  user: User | null = null;
  url: string = "/";

  constructor(
    public loader: LoaderService,
    private swUpdate: SwUpdate,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private iconRegister: MatIconRegistry
  ) {
    this.iconRegister.setDefaultFontSetClass('material-symbols-sharp');

    this.userService.user.subscribe((res) => {
      this.user = res;
      this.loader.hide();
    });
    this.userService.init();

    if (!isDevMode()) {
      const chcker = interval(10000).subscribe(() => {
        if (!this.swUpdate.isEnabled) {
          return;
        }
        chcker.unsubscribe();
        this.swUpdate.versionUpdates
          .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
          .subscribe(evt => {
            this.snackBar
              .open('Update is available', 'Update')
              .onAction()
              .subscribe(() =>
                this.swUpdate
                  .activateUpdate()
                  .then(() => document.location.reload())
              );
          });
        interval(20000).subscribe(() => this.swUpdate.checkForUpdate());
      });
    }
  }

  ngOnInit(): void {

    this.router.events.subscribe((ev: Event) => {
      switch (ev.type) {
        case EventType.NavigationEnd:
          this.url = ev.url;
          break;
      }
    });
  }

  async logout() {
    await this.userService.logout();
    document.location.reload();
  }
}
