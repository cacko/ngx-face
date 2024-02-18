import { Routes, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {
    AuthGuard,
    redirectUnauthorizedTo,
    redirectLoggedInTo,
} from '@angular/fire/auth-guard';
import { LoginComponent } from './components/login/login.component';
import { CameraComponent } from './components/camera/camera.component';
import { GeneratedComponent } from './components/generated/generated.component';
import { generatedResolver, generationsResolver } from './service/api.service';
import { HomeComponent } from './components/home/home.component';

/** add redirect URL to login */
const redirectUnauthorizedToLogin = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return redirectUnauthorizedTo(`/login?redirectTo=${state.url}`);
};

/** Uses the redirectTo query parameter if available to redirect logged in users, or defaults to '/' */
const redirectLoggedInToPreviousPage = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let redirectUrl = '/';
    try {
        const redirectToUrl = new URL(state.url, location.origin);
        const params = new URLSearchParams(redirectToUrl.search);
        redirectUrl = params.get('redirectTo') || '/';
    } catch (err) {
        // invalid URL
    }
    return redirectLoggedInTo(redirectUrl);
};

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
        resolve: {
            data: generationsResolver,
        },
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
    },
    {
        path: 'new',
        component: CameraComponent,
        pathMatch: 'full',
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
    },
    {
        path: 'g/:id',
        component: GeneratedComponent,
        pathMatch: 'full',
        resolve: {
            data: generatedResolver,
        },
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
    },
    {
        path: 'login',
        component: LoginComponent,
        pathMatch: 'full',
        canActivate: [AuthGuard],
        data: { authGuardPipe: redirectLoggedInToPreviousPage },
    },
];
