import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, UserTokenPayload } from '../../../services/auth';
import { NotificacionService } from '../../../services/notificacion.service';

@Component({
  selector: 'app-bodeguero-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit {
  isSidebarOpen = true;
  isSidebarOpenMobile = false;
  user: UserTokenPayload | null = null;
  userInitials = 'BO';
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.user.sub) {
      this.userInitials = this.user.sub.substring(0, 2).toUpperCase();
    }

    this.cargarNotificacionesNoLeidas();
    // Consultar periódicamente notificaciones (ej. cada 60 seg)
    setInterval(() => {
      this.cargarNotificacionesNoLeidas();
    }, 60000);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSidebarMobile() {
    this.isSidebarOpenMobile = !this.isSidebarOpenMobile;
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  cargarNotificacionesNoLeidas() {
    this.notificacionService.consultarPorUsuario().subscribe({
      next: (notifs) => {
        this.unreadCount = notifs.filter(n => !n.leido).length;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar notificaciones no leídas:', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}