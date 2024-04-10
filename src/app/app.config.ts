import { ApplicationConfig, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { provideNgxLocalstorage } from 'ngx-localstorage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    importProvidersFrom(provideFirebaseApp(() => initializeApp({ "projectId": "facision", "appId": "1:987420655172:web:034b56fad9a19d52180611", "storageBucket": "facision.appspot.com", "apiKey": "AIzaSyDPhJq5i3kpX5PeE3NQbMCoKHuj1VOC1Yo", "authDomain": "facision.firebaseapp.com", "messagingSenderId": "987420655172", "measurementId": "G-9JD2CLZF26", "databaseURL": "https://facision-default-rtdb.europe-west1.firebasedatabase.app/" }))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
    importProvidersFrom(provideAnalytics(() => getAnalytics())),
    provideNgxLocalstorage({
      prefix: 'face',
    }),
    ScreenTrackingService, UserTrackingService
  ]
};
