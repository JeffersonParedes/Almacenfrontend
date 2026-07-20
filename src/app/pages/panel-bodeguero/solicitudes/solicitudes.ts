import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { SolicitudService } from '../../../services/solicitud.service';

// Models
import { SolicitudResponse } from '../../../models/solicitud';

@Component({
  selector: 'app-bodeguero-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css'
})
export class SolicitudesComponent implements OnInit {
  solicitudes: SolicitudResponse[] = [];
  filteredSolicitudes: SolicitudResponse[] = [];
  pagedSolicitudes: SolicitudResponse[] = [];

  currentTab: 'PENDIENTE' | 'HISTORIAL' = 'PENDIENTE';
  pendingCount = 0;

  // Search & Pagination
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 0;

  constructor(private solicitudService: SolicitudService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.solicitudService.listarPorEmpresa().subscribe({
      next: (data) => {
        // Ordenar de más reciente a más antigua
        this.solicitudes = data.reverse();
        this.pendingCount = this.solicitudes.filter(s => s.estado === 'PENDIENTE').length;
        this.filtrarYPaginar();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar bandeja de solicitudes:', err)
    });
  }

  setTab(tab: 'PENDIENTE' | 'HISTORIAL') {
    this.currentTab = tab;
    this.currentPage = 1;
    this.filtrarYPaginar();
  }

  filtrarYPaginar() {
    // 1. Filtrar por pestaña activa
    let baseList = this.solicitudes;
    if (this.currentTab === 'PENDIENTE') {
      baseList = this.solicitudes.filter(s => s.estado === 'PENDIENTE');
    } else {
      baseList = this.solicitudes.filter(s => s.estado !== 'PENDIENTE');
    }

    // 2. Filtrar por término de búsqueda
    if (!this.searchTerm.trim()) {
      this.filteredSolicitudes = baseList;
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredSolicitudes = baseList.filter(s => 
        (s.nombreUsuario && s.nombreUsuario.toLowerCase().includes(term)) || 
        (s.tipo && s.tipo.toLowerCase().includes(term)) || 
        (s.observacion && s.observacion.toLowerCase().includes(term))
      );
    }

    // 3. Límites
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredSolicitudes.length);
    this.pagedSolicitudes = this.filteredSolicitudes.slice(this.startIndex, this.endIndex);
  }

  onSearchChange() {
    this.currentPage = 1;
    this.filtrarYPaginar();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filtrarYPaginar();
    }
  }

  nextPage() {
    if (this.endIndex < this.filteredSolicitudes.length) {
      this.currentPage++;
      this.filtrarYPaginar();
    }
  }

  // --- Procesamiento de Solicitudes ---

  aprobar(id: number) {
    if (confirm('¿Estás seguro de aprobar esta solicitud?')) {
      this.solicitudService.procesarSolicitud(id, 'APROBADO').subscribe({
        next: () => {
          alert('Solicitud aprobada con éxito.');
          this.cargarSolicitudes();
        },
        error: (err) => {
          console.error(err);
          alert('Error al aprobar la solicitud.');
        }
      });
    }
  }

  rechazar(id: number) {
    const motivo = prompt('Por favor, indique el motivo de rechazo de la solicitud:');
    if (motivo === null) return; // Canceló el prompt
    
    if (!motivo.trim()) {
      alert('Debe proporcionar un motivo para rechazar la solicitud.');
      return;
    }

    this.solicitudService.procesarSolicitud(id, 'RECHAZADO', motivo).subscribe({
      next: () => {
        alert('Solicitud rechazada.');
        this.cargarSolicitudes();
      },
      error: (err) => {
        console.error(err);
        alert('Error al rechazar la solicitud.');
      }
    });
  }
}