import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Verificamos si existe el token en el localStorage
  const token = localStorage.getItem('token');

  if (token) {
    // Si hay token, el portero lo deja pasar
    return true;
  } else {
    // Si no hay token, lo mandamos de vuelta al login
    router.navigate(['/login']);
    return false;
  }
};
