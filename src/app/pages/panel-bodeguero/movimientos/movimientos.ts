import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { MovimientoService } from '../../../services/movimiento';
import { ProductoService } from '../../../services/producto';
import { AlmacenService } from '../../../services/almacen';
import { LoteService } from '../../../services/lote.service';

// Models
import { MovimientoRequest, MovimientoResponse } from '../../../models/movimiento';
import { Producto } from '../../../models/producto';
import { Almacen } from '../../../models/almacen';
import { LoteResponse } from '../../../models/lote';

@Component({
  selector: 'app-bodeguero-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css'
})
export class MovimientosComponent implements OnInit {
  productosAprobados: Producto[] = [];
  almacenes: Almacen[] = [];
  lotesProducto: LoteResponse[] = [];
  kardex: MovimientoResponse[] = [];
  filteredKardex: MovimientoResponse[] = [];
  pagedKardex: MovimientoResponse[] = [];

  // Form State
  formMovimiento: MovimientoRequest = {
    productoId: 0,
    almacenId: 0,
    tipoMovimiento: 'ENTRADA',
    cantidad: 0,
    motivo: '',
    loteId: undefined,
    destinoAlmacenId: undefined
  };

  // Search & Filters State
  searchTerm = '';
  selectedTypeFilter = '';
  currentPage = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private movimientoService: MovimientoService,
    private productoService: ProductoService,
    private almacenService: AlmacenService,
    private loteService: LoteService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarProductos();
    this.cargarAlmacenes();
    this.cargarKardex();
  }

  cargarProductos() {
    this.productoService.listarActivos().subscribe({
      next: (data) => {
        this.productosAprobados = data.filter(p => p.estadoAprobacion === 'APROBADO' || p.estadoAprobacion === 'APROBADA');
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar productos para movimientos:', err)
    });
  }

  cargarAlmacenes() {
    this.almacenService.getAlmacenes().subscribe({
      next: (data) => {
        this.almacenes = data.filter(a => a.activo !== false);
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar almacenes para movimientos:', err)
    });
  }

  cargarKardex() {
    this.movimientoService.listarKardex().subscribe({
      next: (data) => {
        // Ordenar del más reciente al más antiguo
        this.kardex = data.reverse();
        this.filtrarYPaginar();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar historial del Kardex:', err)
    });
  }

  onTipoMovimientoChange() {
    if (this.formMovimiento.tipoMovimiento !== 'TRASLADO') {
      this.formMovimiento.destinoAlmacenId = undefined;
    }
  }

  onProductoChange() {
    this.lotesProducto = [];
    this.formMovimiento.loteId = undefined;
    
    if (!this.formMovimiento.productoId) return;
    const prodId = Number(this.formMovimiento.productoId);
    
    this.loteService.listarLotesPorProducto(prodId).subscribe({
      next: (data) => {
        this.lotesProducto = data;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar lotes para el producto:', err)
    });
  }

  registrarMovimiento() {
    if (!this.formMovimiento.productoId) {
      alert('Debe seleccionar un producto');
      return;
    }
    if (!this.formMovimiento.almacenId) {
      alert('Debe seleccionar el almacén');
      return;
    }
    if (this.formMovimiento.tipoMovimiento === 'TRASLADO' && !this.formMovimiento.destinoAlmacenId) {
      alert('Debe seleccionar el almacén de destino para traslados');
      return;
    }
    if (this.formMovimiento.cantidad === undefined || this.formMovimiento.cantidad === null || this.formMovimiento.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    // Cast numérico
    this.formMovimiento.productoId = Number(this.formMovimiento.productoId);
    this.formMovimiento.almacenId = Number(this.formMovimiento.almacenId);
    if (this.formMovimiento.loteId) this.formMovimiento.loteId = Number(this.formMovimiento.loteId);
    if (this.formMovimiento.destinoAlmacenId) this.formMovimiento.destinoAlmacenId = Number(this.formMovimiento.destinoAlmacenId);

    // Invocar endpoint según tipo
    let action$;
    switch (this.formMovimiento.tipoMovimiento) {
      case 'ENTRADA':
        action$ = this.movimientoService.registrarEntrada(this.formMovimiento);
        break;
      case 'SALIDA':
        action$ = this.movimientoService.registrarSalida(this.formMovimiento);
        break;
      case 'TRASLADO':
        action$ = this.movimientoService.registrarTraslado(this.formMovimiento);
        break;
      case 'AJUSTE':
        action$ = this.movimientoService.registrarAjuste(this.formMovimiento);
        break;
      default:
        action$ = this.movimientoService.registrarMovimiento(this.formMovimiento);
    }

    action$.subscribe({
      next: (res) => {
        alert('Transacción de inventario registrada con éxito.');
        this.cargarKardex();
        
        // Limpiar form
        this.formMovimiento = {
          productoId: 0,
          almacenId: 0,
          tipoMovimiento: 'ENTRADA',
          cantidad: 0,
          motivo: '',
          loteId: undefined,
          destinoAlmacenId: undefined
        };
        this.lotesProducto = [];
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error al procesar el movimiento de stock. Verifique disponibilidad.');
      }
    });
  }

  // --- Filtros & Paginación ---

  onFilterChange() {
    this.currentPage = 1;
    this.filtrarYPaginar();
  }

  filtrarYPaginar() {
    this.filteredKardex = this.kardex.filter(mov => {
      const matchSearch = !this.searchTerm.trim() || 
        (mov.producto?.nombre && mov.producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase().trim())) ||
        (mov.lote?.numeroLote && mov.lote.numeroLote.toLowerCase().includes(this.searchTerm.toLowerCase().trim()));
        
      const matchType = !this.selectedTypeFilter || (mov.tipoMovimiento === this.selectedTypeFilter);
      
      return matchSearch && matchType;
    });

    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredKardex.length);
    this.pagedKardex = this.filteredKardex.slice(this.startIndex, this.endIndex);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filtrarYPaginar();
    }
  }

  nextPage() {
    if (this.endIndex < this.filteredKardex.length) {
      this.currentPage++;
      this.filtrarYPaginar();
    }
  }
}