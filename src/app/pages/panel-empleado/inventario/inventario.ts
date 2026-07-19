import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { InventarioService } from '../../../services/inventario.service';
import { AlmacenService } from '../../../services/almacen';

// Models
import { InventarioResponse } from '../../../models/movimiento';
import { Almacen } from '../../../models/almacen';

@Component({
  selector: 'app-empleado-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class EmpleadoInventarioComponent implements OnInit {
  inventario: InventarioResponse[] = [];
  almacenes: Almacen[] = [];

  filteredInventario: InventarioResponse[] = [];
  pagedInventario: InventarioResponse[] = [];

  // Filters
  searchTerm = '';
  selectedAlmacenId?: number = undefined;
  onlyCritical = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private inventarioService: InventarioService,
    private almacenService: AlmacenService
  ) { }

  ngOnInit() {
    this.cargarAlmacenes();
    this.cargarInventario();
  }

  cargarAlmacenes() {
    this.almacenService.getAlmacenes().subscribe({
      next: (data: Almacen[]) => this.almacenes = data.filter(a => a.activo !== false),
      error: (err: any) => console.error('Error al cargar almacenes:', err)
    });
  }

  cargarInventario() {
    this.inventarioService.listarPorEmpresa().subscribe({
      next: (data: InventarioResponse[]) => {
        this.inventario = data;
        this.filtrarYPaginar();
      },
      error: (err: any) => console.error('Error al cargar inventario general:', err)
    });
  }

  filtrarYPaginar() {
    let baseList = this.inventario;

    // 1. Filtrar por almacén
    if (this.selectedAlmacenId) {
      const targetAlmId = Number(this.selectedAlmacenId);
      baseList = baseList.filter(item => item.almacen.id === targetAlmId);
    }

    // 2. Filtrar por stock crítico
    if (this.onlyCritical) {
      baseList = baseList.filter(item => item.stockActual <= item.stockMinimo);
    }

    // 3. Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      baseList = baseList.filter(item => 
        item.producto.nombre.toLowerCase().includes(term) || 
        (item.producto.codigoBarras && item.producto.codigoBarras.toLowerCase().includes(term))
      );
    }

    this.filteredInventario = baseList;

    // 4. Paginar
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredInventario.length);
    this.pagedInventario = this.filteredInventario.slice(this.startIndex, this.endIndex);
  }

  onFilterChange() {
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
    if (this.endIndex < this.filteredInventario.length) {
      this.currentPage++;
      this.filtrarYPaginar();
    }
  }
}
