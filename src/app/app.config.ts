import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Cambiado a withInterceptors
import { authInterceptor } from './core/auth-interceptor'; // Importamos el interceptor creado

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Registramos nuestro interceptor aquí para que funcione globalmente
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
