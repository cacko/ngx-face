import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideNgxLocalstorage } from 'ngx-localstorage';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideAnimationsAsync(),
    (provideFirebaseApp(() => initializeApp({ "projectId": "facision", "appId": "1:987420655172:web:034b56fad9a19d52180611", "storageBucket": "facision.appspot.com", "apiKey": "AIzaSyDPhJq5i3kpX5PeE3NQbMCoKHuj1VOC1Yo", "authDomain": "facision.firebaseapp.com", "messagingSenderId": "987420655172", "measurementId": "G-9JD2CLZF26", "databaseURL": "https://facision-default-rtdb.europe-west1.firebasedatabase.app/" }))),
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService, UserTrackingService,
    provideDatabase(() => getDatabase()),
    provideNgxLocalstorage({
      prefix: "face"
    }), provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })]
};
