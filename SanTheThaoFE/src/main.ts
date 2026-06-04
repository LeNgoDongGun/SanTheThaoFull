import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';

import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { provideHttpClient } from '@angular/common/http'; // 👈 THÊM

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient() // 👈 QUAN TRỌNG NHẤT
  ]
}).catch(err => console.error(err));