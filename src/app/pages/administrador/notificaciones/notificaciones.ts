import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../../services/notificacion';
import { AdministradorService } from '../../../services/administrador';
import { EmpresaService } from '../../../services/empresa';
import { NotificacionResponse } from '../../../models/notificacion';
import { Empresa } from '../../../models/empresa';

@Component({
  selector: 'app-administrador-notificaciones',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class AdministradorNotificacionesComponent implements OnInit {
  notifications: NotificacionResponse[] = [];
  empresas: Empresa[] = [];

  broadcastForm = {
    empresaId: null as number | null,
    usuarioId: null as number | null,
    tipo: 'SISTEMA',
    titulo: '',
    mensaje: ''
  };

  constructor(
    private notificacionService: NotificacionService,
    private administradorService: AdministradorService,
    private empresaService: EmpresaService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarNotificaciones();
    this.cargarEmpresas();
  }

  cargarNotificaciones(): void {
    this.notificacionService.consultarPorAdministrador().subscribe({
      next: (res) => {
        this.notifications = res;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar notificaciones', err);
      }
    });
  }

  cargarEmpresas(): void {
    this.empresaService.listarTodas().subscribe({
      next: (res) => {
        this.empresas = res;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar empresas', err);
      }
    });
  }

  marcarLeida(id: number): void {
    this.notificacionService.marcarComoLeida(id).subscribe({
      next: () => {
        this.cargarNotificaciones();
      },
      error: (err) => {
        console.error('Error al marcar leida', err);
      }
    });
  }

  emitirAviso(): void {
    // Conversión a tipo numérico en caso de que sea string desde el select
    const targetEmpresaId = this.broadcastForm.empresaId ? Number(this.broadcastForm.empresaId) : null;
    
    const payload = {
      ...this.broadcastForm,
      empresaId: targetEmpresaId
    };

    this.administradorService.enviarNotificacionGlobal(payload).subscribe({
      next: () => {
        alert('Notificación enviada con éxito.');
        this.limpiarFormulario();
        this.cargarNotificaciones();
      },
      error: (err) => {
        console.error('Error al enviar notificación global', err);
        alert('Error al enviar notificación.');
      }
    });
  }

  private limpiarFormulario(): void {
    this.broadcastForm = {
      empresaId: null,
      usuarioId: null,
      tipo: 'SISTEMA',
      titulo: '',
      mensaje: ''
    };
  }
}