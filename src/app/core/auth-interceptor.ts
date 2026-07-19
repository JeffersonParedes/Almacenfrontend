import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtenemos el token desde donde sea que lo guardes (localStorage es lo estándar)
  const token = localStorage.getItem('token');

  if (token) {
    // Clonamos la petición y le añadimos el header de Authorization
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }

  // Si no hay token, enviamos la petición tal cual
  return next(req);
};
