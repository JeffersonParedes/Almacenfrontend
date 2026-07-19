import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-bodeguero-placeholder',
  standalone: true,
  template: `
    <div style="padding: 3rem; text-align: center; font-family: sans-serif; background: #0f172a; color: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h1>Panel de Bodeguero</h1>
      <p style="color: #94a3b8; margin-top: 1rem;">La interfaz para el rol Bodeguero se habilitará en las siguientes fases.</p>
      <button (click)="logout()" style="margin-top: 2rem; padding: 0.8rem 1.5rem; background: #ef4444; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">
        Cerrar Sesión
      </button>
    </div>
  `
})
export class BodegueroPlaceholderComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
