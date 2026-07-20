import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { SolicitudService } from '../../../services/solicitud.service';
import { AuthService } from '../../../services/auth';

// Models
import { SolicitudResponse } from '../../../models/solicitud';

@Component({
  selector: 'app-empleado-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css'
})
export class EmpleadoSolicitudesComponent implements OnInit {
  solicitudes: SolicitudResponse[] = [];
  filteredSolicitudes: SolicitudResponse[] = [];
  pagedSolicitudes: SolicitudResponse[] = [];

  currentTab: 'PENDIENTE' | 'HISTORIAL' = 'PENDIENTE';

  // Search & Pagination
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    const payload = this.authService.currentUserValue;
    if (!payload || !payload.usuarioId) return;

    const loggedInUserId = Number(payload.usuarioId);

    this.solicitudService.listarPorEmpresa().subscribe({
      next: (data) => {
        // Filtrar localmente por el ID del empleado que realizó la solicitud
        this.solicitudes = data.filter(sol => sol.usuarioId === loggedInUserId).reverse();
        this.filtrarYPaginar();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar solicitudes del empleado:', err)
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

    // 2. Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      baseList = baseList.filter(s => 
        (s.tipo && s.tipo.toLowerCase().includes(term)) || 
        (s.observacion && s.observacion.toLowerCase().includes(term))
      );
    }

    this.filteredSolicitudes = baseList;

    // 3. Paginación
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
}