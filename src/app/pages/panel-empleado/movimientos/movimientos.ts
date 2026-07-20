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

@Component({
  selector: 'app-empleado-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css'
})
export class EmpleadoMovimientosComponent implements OnInit {
  productos: Producto[] = [];
  almacenes: Almacen[] = [];
  lotesDisponibles: any[] = [];
  movimientos: MovimientoResponse[] = [];

  filteredMovimientos: MovimientoResponse[] = [];
  pagedMovimientos: MovimientoResponse[] = [];

  // Form State
  formMovimiento: MovimientoRequest = {
    productoId: undefined as any,
    almacenId: undefined as any,
    tipoMovimiento: 'ENTRADA',
    cantidad: undefined as any,
    motivo: '',
    loteId: undefined,
    destinoAlmacenId: undefined
  };

  // Search & Pagination
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 0;

  // Type helper for template casting
  Number = Number;

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
      next: (data: Producto[]) => {
        this.productos = data.filter(p => p.estadoAprobacion === 'APROBADO' || p.estadoAprobacion === 'APROBADA');
        this.cdRef.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar productos aprobados para Kardex:', err)
    });
  }

  cargarAlmacenes() {
    this.almacenService.getAlmacenes().subscribe({
      next: (data: Almacen[]) => {
        this.almacenes = data.filter(a => a.activo !== false);
        this.cdRef.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar almacenes activos para Kardex:', err)
    });
  }

  cargarKardex() {
    this.movimientoService.listarKardex().subscribe({
      next: (data: MovimientoResponse[]) => {
        // Mostrar movimientos más recientes primero
        this.movimientos = data.reverse();
        this.filtrarYPaginar();
        this.cdRef.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar Kardex general:', err)
    });
  }

  onProductoChange() {
    this.lotesDisponibles = [];
    this.formMovimiento.loteId = undefined;
    
    if (this.formMovimiento.productoId) {
      const prodId = Number(this.formMovimiento.productoId);
      this.loteService.listarLotesPorProducto(prodId).subscribe({
        next: (data: any[]) => {
        this.lotesDisponibles = data;
        this.cdRef.detectChanges();
      },
        error: (err: any) => console.error('Error al cargar lotes para el producto:', err)
      });
    }
  }

  onTipoMovimientoChange() {
    this.formMovimiento.destinoAlmacenId = undefined;
    this.formMovimiento.loteId = undefined;
  }

  filtrarYPaginar() {
    if (!this.searchTerm.trim()) {
      this.filteredMovimientos = [...this.movimientos];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredMovimientos = this.movimientos.filter(mov => 
        mov.producto.nombre.toLowerCase().includes(term) || 
        (mov.lote?.numeroLote && mov.lote.numeroLote.toLowerCase().includes(term)) || 
        mov.almacen.nombre.toLowerCase().includes(term) || 
        (mov.destinoAlmacen?.nombre && mov.destinoAlmacen.nombre.toLowerCase().includes(term)) || 
        mov.nombreUsuario.toLowerCase().includes(term)
      );
    }

    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredMovimientos.length);
    this.pagedMovimientos = this.filteredMovimientos.slice(this.startIndex, this.endIndex);
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
    if (this.endIndex < this.filteredMovimientos.length) {
      this.currentPage++;
      this.filtrarYPaginar();
    }
  }

  // --- Registrar ---

  registrarMovimiento() {
    if (!this.formMovimiento.productoId) {
      alert('Debe seleccionar un producto');
      return;
    }
    if (!this.formMovimiento.almacenId) {
      alert('Debe seleccionar el almacén origen');
      return;
    }
    if (!this.formMovimiento.cantidad || this.formMovimiento.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    if (this.formMovimiento.tipoMovimiento === 'TRASLADO' && !this.formMovimiento.destinoAlmacenId) {
      alert('Debe seleccionar un almacén de destino para el traslado');
      return;
    }

    // Casteo adecuado de tipos numéricos
    const payload: MovimientoRequest = {
      productoId: Number(this.formMovimiento.productoId),
      almacenId: Number(this.formMovimiento.almacenId),
      tipoMovimiento: this.formMovimiento.tipoMovimiento,
      cantidad: Number(this.formMovimiento.cantidad),
      motivo: this.formMovimiento.motivo
    };

    if (this.formMovimiento.loteId) payload.loteId = Number(this.formMovimiento.loteId);
    if (this.formMovimiento.destinoAlmacenId) payload.destinoAlmacenId = Number(this.formMovimiento.destinoAlmacenId);

    let action$;
    switch (this.formMovimiento.tipoMovimiento) {
      case 'ENTRADA':
        action$ = this.movimientoService.registrarEntrada(payload);
        break;
      case 'SALIDA':
        action$ = this.movimientoService.registrarSalida(payload);
        break;
      case 'TRASLADO':
        action$ = this.movimientoService.registrarTraslado(payload);
        break;
      case 'AJUSTE':
        action$ = this.movimientoService.registrarAjuste(payload);
        break;
      default:
        alert('Tipo de movimiento desconocido.');
        return;
    }

    action$.subscribe({
      next: () => {
        alert('Transacción de Kardex registrada correctamente.');
        // Limpiar formulario
        this.formMovimiento = {
          productoId: undefined as any,
          almacenId: undefined as any,
          tipoMovimiento: 'ENTRADA',
          cantidad: undefined as any,
          motivo: '',
          loteId: undefined,
          destinoAlmacenId: undefined
        };
        this.lotesDisponibles = [];
        this.cargarKardex();
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        alert(err.error?.message || 'Error al procesar la transacción de stock.');
      }
    });
  }
}