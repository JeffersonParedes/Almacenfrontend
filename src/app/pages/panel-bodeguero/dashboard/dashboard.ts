import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Services
import { DashboardService } from '../../../services/dashboard.service';
import { AlmacenService } from '../../../services/almacen';
import { UsuarioService } from '../../../services/usuario';
import { MovimientoService } from '../../../services/movimiento';
import { SolicitudService } from '../../../services/solicitud.service';

// Models
import { DashboardBodegueroResponse } from '../../../models/dashboard';
import { Almacen } from '../../../models/almacen';
import { Usuario } from '../../../models/usuario';
import { MovimientoResponse, InventarioResponse } from '../../../models/movimiento';
import { SolicitudResponse } from '../../../models/solicitud';

@Component({
  selector: 'app-bodeguero-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats: DashboardBodegueroResponse | null = null;
  almacenesCount = 0;
  empleadosCount = 0;
  recentMovements: MovimientoResponse[] = [];
  criticalStockItems: InventarioResponse[] = [];
  pendingRequests: SolicitudResponse[] = [];

  constructor(
    private dashboardService: DashboardService,
    private almacenService: AlmacenService,
    private usuarioService: UsuarioService,
    private movimientoService: MovimientoService,
    private solicitudService: SolicitudService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarDashboardStats();
    this.cargarAlmacenesCount();
    this.cargarEmpleadosCount();
    this.cargarMovimientosRecientes();
    this.cargarInventarioCritico();
    this.cargarSolicitudesPendientes();
  }

  cargarDashboardStats() {
    this.dashboardService.obtenerDashboardBodeguero().subscribe({
      next: (res) => {
        this.stats = res;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar métricas del dashboard:', err)
    });
  }

  cargarAlmacenesCount() {
    this.almacenService.getAlmacenes().subscribe({
      next: (res) => {
        this.almacenesCount = res.length;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar cantidad de almacenes:', err)
    });
  }

  cargarEmpleadosCount() {
    this.usuarioService.listarPorEmpresa().subscribe({
      next: (res) => {
        // Filtrar solo empleados operativos (no bodegueros) si es necesario, o contar todos los usuarios creados
        this.empleadosCount = res.filter(u => u.rol === 'EMPLEADO').length;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar cantidad de empleados:', err)
    });
  }

  cargarMovimientosRecientes() {
    this.movimientoService.listarKardex().subscribe({
      next: (res) => {
        // Tomar los 5 movimientos más recientes
        this.recentMovements = res.reverse().slice(0, 5);
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar movimientos recientes:', err)
    });
  }

  cargarInventarioCritico() {
    this.movimientoService.listarInventario().subscribe({
      next: (res) => {
        // Filtrar productos con stock actual <= stock mínimo
        this.criticalStockItems = res.filter(item => item.stockActual <= item.stockMinimo).slice(0, 5);
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar inventario crítico:', err)
    });
  }

  cargarSolicitudesPendientes() {
    this.solicitudService.listarPorEmpresa().subscribe({
      next: (res) => {
        this.pendingRequests = res.filter(r => r.estado === 'PENDIENTE');
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar solicitudes pendientes:', err)
    });
  }

  calcularPorcentajeStock(actual: number, minimo: number): number {
    if (minimo === 0) return 100;
    const pct = (actual / minimo) * 100;
    return Math.min(Math.max(pct, 5), 100); // Rango entre 5% y 100% para visualización estética
  }
}