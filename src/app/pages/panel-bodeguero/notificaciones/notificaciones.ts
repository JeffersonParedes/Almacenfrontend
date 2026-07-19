import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { NotificacionService } from '../../../services/notificacion.service';

// Models
import { NotificacionResponse } from '../../../models/notificacion';

@Component({
  selector: 'app-bodeguero-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css'
})
export class NotificacionesComponent implements OnInit {
  notifications: NotificacionResponse[] = [];
  unreadCount = 0;

  constructor(private notificacionService: NotificacionService) { }

  ngOnInit() {
    this.cargarNotificaciones();
  }

  cargarNotificaciones() {
    this.notificacionService.consultarPorUsuario().subscribe({
      next: (data) => {
        // Ordenar de más reciente a más antigua
        this.notifications = data.reverse();
        this.unreadCount = this.notifications.filter(n => !n.leido).length;
      },
      error: (err) => console.error('Error al cargar notificaciones:', err)
    });
  }

  marcarLeido(id: number) {
    this.notificacionService.marcarComoLeida(id).subscribe({
      next: () => {
        this.cargarNotificaciones();
      },
      error: (err) => {
        console.error(err);
        alert('Error al marcar la notificación como leída.');
      }
    });
  }
}
