import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = route.data?.['roles'] as Array<string>;

  if (authService.currentUserValue && authService.hasRole(expectedRoles)) {
    return true;
  }

  alert('Acceso denegado. No tienes permisos para ingresar a esta ruta.');
  router.navigate(['/login']);
  return false;
};
