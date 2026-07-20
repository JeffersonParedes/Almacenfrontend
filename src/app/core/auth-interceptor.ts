import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  console.log('[AuthInterceptor] Petición a:', req.url, '| Token presente:', !!token);

  let reqToHandle = req;

  if (token) {
    reqToHandle = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(reqToHandle).pipe(
    catchError((error: HttpErrorResponse) => {
      console.warn('[AuthInterceptor] Error HTTP:', error.status, 'en', req.url);
      if (error.status === 401) {
        console.warn('Sesión no autorizada (HTTP 401). Redirigiendo a inicio de sesión...');
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
