import { Component, OnInit, isDevMode } from '@angular/core';
import { Event, EventType, Router, RouterModule, RouterOutlet } from '@angular/router';
import { CameraComponent } from './components/camera/camera.component';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { LoaderService } from './service/loader.service';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { interval } from 'rxjs';
import { UserService } from './service/user.service';
import { User } from '@angular/fire/auth';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgPipesModule } from 'ngx-pipes';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from './service/database.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AvatarComponent } from './components/avatar/avatar.component';

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
    MatSnackBarModule,
    MatMenuModule,
    MatDividerModule,
    AvatarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  user: User | null = null;
  url: string = "/";

  constructor(
    public loader: LoaderService,
    private swUpdate: SwUpdate,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private iconRegister: MatIconRegistry,
    private db: DatabaseService
  ) {
    this.iconRegister.setDefaultFontSetClass('material-symbols-sharp');

    this.userService.user.subscribe((res) => {
      this.user = res;
      this.user?.uid && this.db.init(this.user?.uid);
      this.loader.hide();
    });
    this.userService.init();
  }

  ngOnInit(): void {
    if (isDevMode() === false) {
      this.swUpdate.versionUpdates.subscribe((evt: VersionEvent) => {
        if (evt.type == 'VERSION_READY') {
          this.snackBar
            .open('Update is available', 'Update', { duration: 15000 })
            .afterDismissed()
            .subscribe(() =>
              this.swUpdate
                .activateUpdate()
                .then(() => document.location.reload())
            );
        }
      })
      interval(20000).subscribe(() => this.swUpdate.checkForUpdate());
    }
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
