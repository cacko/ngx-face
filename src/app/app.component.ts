import { Component, OnInit, isDevMode } from '@angular/core';
import { ActivatedRoute, Event, EventType, Router, RouterEvent, RouterModule, RouterOutlet, UrlSegment } from '@angular/router';
import { CameraComponent } from './components/camera/camera.component';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { LoaderService } from './service/loader.service';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { UserService } from './service/user.service';
import { User } from '@angular/fire/auth';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgPipesModule } from 'ngx-pipes';


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
    RouterModule
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
    private router: Router
  ) {
    if (!isDevMode()) {
      this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(evt => {
          document.location.reload();
      });
    }
    this.userService.user.subscribe((res) => {
      this.user = res;
      this.loader.hide();
    });
    this.userService.init();

  }

  ngOnInit(): void {
    this.router.events.subscribe((ev: Event) => {
      switch (ev.type) {
        case EventType.NavigationEnd:
          this.url = ev.url;
          break;
      }
    }) 

  }

  async logout() {
    await this.userService.logout();
    document.location.reload();
  }
}
