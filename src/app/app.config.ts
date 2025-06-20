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
    (provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyDzYmIQxwh0UzzdO4GFJxCAKYq1oxpkapk",
      authDomain: "facision.firebaseapp.com",
      databaseURL: "https://facision-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "facision",
      storageBucket: "facision.firebasestorage.app",
      messagingSenderId: "987420655172",
      appId: "1:987420655172:web:a5837be67f3f5906180611",
      measurementId: "G-T65VV6P5QV"
    
    }))),
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
