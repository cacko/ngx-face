import { Component, OnInit, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CameraComponent } from './components/camera/camera.component';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { LoaderService } from './service/loader.service';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { interval } from 'rxjs';
import { UserService } from './service/user.service';
import { User } from '@angular/fire/auth';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    CameraComponent, CommonModule,
    LoaderComponent, MatSnackBarModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'facision';
  user: User | null = null;

  constructor(
    public loader: LoaderService,
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {
    this.userService.user.subscribe((res) => {
      this.user = res;
      this.loader.hide();

    });
    this.userService.init();

  }

  ngOnInit(): void {
    if (!isDevMode()) {
      this.swUpdate.versionUpdates.subscribe((evt: VersionEvent) => {
        if (evt.type == "VERSION_READY") {
          this.snackBar
            .open("Update is available", "Update", { duration: 15000 })
            .afterDismissed()
            .subscribe(() =>
              this.swUpdate
                .activateUpdate()
                .then(() => document.location.reload())
            );
        }
      });
      interval(10000).subscribe(() => {
        this.swUpdate.checkForUpdate();
      });
    }

  }

  logout() {
    this.userService.logout();
  }
}
