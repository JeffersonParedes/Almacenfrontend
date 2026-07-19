import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

// Services
import { AuthService } from '../../../services/auth';
import { NotificacionService } from '../../../services/notificacion.service';

@Component({
  selector: 'app-empleado-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class EmpleadoLayoutComponent implements OnInit {
  isCollapsed = false;
  userName = 'Empleado';
  initials = 'EM';
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private router: Router
  ) { }

  ngOnInit() {
    const payload = this.authService.currentUserValue;
    if (payload) {
      this.userName = payload.sub || 'Empleado';
      this.initials = this.userName.substring(0, 2).toUpperCase();
    }
    this.cargarNotificaciones();
  }

  cargarNotificaciones() {
    this.notificacionService.consultarPorUsuario().subscribe({
      next: (data) => {
        this.unreadCount = data.filter(n => !n.leido).length;
      },
      error: (err) => console.error('Error al consultar alertas en layout:', err)
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
