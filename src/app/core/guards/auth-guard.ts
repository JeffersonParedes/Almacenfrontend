import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
        return false;
      }

      let base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decodedPayload = JSON.parse(jsonPayload);

      // Verificar si el token ya expiró
      if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
        return false;
      }

      return true;
    } catch (e) {
      console.error('Error al verificar token en authGuard:', e);
      localStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }
  } else {
    router.navigate(['/login']);
    return false;
  }
};
