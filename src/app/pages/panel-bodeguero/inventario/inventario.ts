import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { InventarioService } from '../../../services/inventario.service';
import { AlmacenService } from '../../../services/almacen';

// Models
import { Almacen } from '../../../models/almacen';
import { InventarioResponse } from '../../../models/movimiento';

@Component({
  selector: 'app-bodeguero-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class InventarioComponent implements OnInit {
  inventario: InventarioResponse[] = [];
  filteredInventario: InventarioResponse[] = [];
  pagedInventario: InventarioResponse[] = [];
  almacenes: Almacen[] = [];

  // Filters State
  selectedAlmacenFilter = '';
  onlyCriticalStock = false;
  searchTerm = '';

  // Pagination State
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
      next: (data) => this.almacenes = data.filter(a => a.activo !== false),
      error: (err) => console.error('Error al cargar almacenes para filtros:', err)
    });
  }

  cargarInventario() {
    if (!this.selectedAlmacenFilter) {
      // Listar todo
      this.inventarioService.listarPorEmpresa().subscribe({
        next: (data) => {
          this.inventario = data;
          this.filtrarYPaginar();
        },
        error: (err) => console.error('Error al cargar inventario total:', err)
      });
    } else {
      // Listar por almacén
      const almId = Number(this.selectedAlmacenFilter);
      this.inventarioService.listarPorAlmacen(almId).subscribe({
        next: (data) => {
          this.inventario = data;
          this.filtrarYPaginar();
        },
        error: (err) => console.error('Error al cargar inventario de almacén:', err)
      });
    }
  }

  onAlmacenFilterChange() {
    this.currentPage = 1;
    this.cargarInventario();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.filtrarYPaginar();
  }

  filtrarYPaginar() {
    // 1. Filtrar búsqueda y stock crítico
    this.filteredInventario = this.inventario.filter(item => {
      const matchSearch = !this.searchTerm.trim() || 
        (item.producto?.nombre && item.producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase().trim())) || 
        (item.producto?.codigoBarras && item.producto.codigoBarras.toLowerCase().includes(this.searchTerm.toLowerCase().trim()));
        
      const matchCritical = !this.onlyCriticalStock || (item.stockActual <= item.stockMinimo);
      
      return matchSearch && matchCritical;
    });

    // 2. Límites
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredInventario.length);

    // 3. Paginación
    this.pagedInventario = this.filteredInventario.slice(this.startIndex, this.endIndex);
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
