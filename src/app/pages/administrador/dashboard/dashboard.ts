import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../../services/dashboard';
import { NotificacionService } from '../../../services/notificacion';
import { AuthService } from '../../../services/auth';
import { DashboardAdminResponse } from '../../../models/dashboard';
import { NotificacionResponse } from '../../../models/notificacion';

@Component({
  selector: 'app-administrador-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdministradorDashboardComponent implements OnInit {
  username: string = 'Super Administrador';
  stats: DashboardAdminResponse = {
    empresasActivas: 0,
    empresasSuspendidas: 0,
    suscripcionesPorVencer: 0,
    nuevasEmpresasMes: 0
  };
  notifications: NotificacionResponse[] = [];

  constructor(
    private dashboardService: DashboardService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const payload = this.authService.currentUserValue;
    if (payload) {
      this.username = payload.sub;
    }
    this.cargarStats();
    this.cargarNotificaciones();
  }

  cargarStats(): void {
    this.dashboardService.obtenerDashboardAdmin().subscribe({
      next: (res) => {
        this.stats = res;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas', err);
      }
    });
  }

  cargarNotificaciones(): void {
    this.notificacionService.consultarPorAdministrador().subscribe({
      next: (res) => {
        // Mostrar máximo 5 notificaciones recientes
        this.notifications = res.slice(0, 5);
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar notificaciones', err);
      }
    });
  }
}