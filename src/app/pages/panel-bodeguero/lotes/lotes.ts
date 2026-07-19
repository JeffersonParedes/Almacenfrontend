import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { LoteService } from '../../../services/lote.service';
import { ProductoService } from '../../../services/producto';

// Models
import { LoteRequest, LoteResponse } from '../../../models/lote';
import { Producto } from '../../../models/producto';

@Component({
  selector: 'app-bodeguero-lotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lotes.html',
  styleUrl: './lotes.css'
})
export class LotesComponent implements OnInit {
  productosAprobados: Producto[] = [];
  lotes: LoteResponse[] = [];

  // Form State
  formLote: LoteRequest = {
    empresaId: 0, // Injected by backend
    productoId: 0,
    numeroLote: '',
    fechaFabricacion: undefined,
    fechaVencimiento: undefined,
    cantidadActual: 0,
    costoCompra: 0
  };

  // Query State
  queryMode = 'PRODUCTO';
  selectedProductoId?: number;

  constructor(
    private loteService: LoteService,
    private productoService: ProductoService
  ) { }

  ngOnInit() {
    this.cargarProductosAprobados();
  }

  cargarProductosAprobados() {
    this.productoService.listarActivos().subscribe({
      next: (prods) => {
        // Filtrar productos que estén explícitamente aprobados en el catálogo
        this.productosAprobados = prods.filter(p => p.estadoAprobacion === 'APROBADO' || p.estadoAprobacion === 'APROBADA');
      },
      error: (err) => console.error('Error al cargar productos para lotes:', err)
    });
  }

  onQueryModeChange() {
    this.lotes = [];
    if (this.queryMode === 'PRODUCTO') {
      if (this.selectedProductoId) {
        this.cargarLotesPorProducto();
      }
    } else if (this.queryMode === 'VENCIMIENTO_30') {
      this.cargarLotesPorVencer(30);
    } else if (this.queryMode === 'VENCIMIENTO_60') {
      this.cargarLotesPorVencer(60);
    } else if (this.queryMode === 'VENCIMIENTO_90') {
      this.cargarLotesPorVencer(90);
    }
  }

  cargarLotesPorProducto() {
    if (!this.selectedProductoId) return;
    const prodId = Number(this.selectedProductoId);
    this.loteService.listarLotesPorProducto(prodId).subscribe({
      next: (data) => this.lotes = data,
      error: (err) => console.error('Error al cargar lotes del producto:', err)
    });
  }

  cargarLotesPorVencer(dias: number) {
    this.loteService.consultarLotesPorVencer(dias).subscribe({
      next: (data) => this.lotes = data,
      error: (err) => console.error(`Error al cargar lotes por vencer (${dias} días):`, err)
    });
  }

  registrarLote() {
    if (!this.formLote.productoId) {
      alert('Debe seleccionar un producto');
      return;
    }
    if (!this.formLote.numeroLote.trim()) {
      alert('El número de lote es obligatorio');
      return;
    }
    if (this.formLote.cantidadActual === undefined || this.formLote.cantidadActual === null || this.formLote.cantidadActual < 0) {
      alert('La cantidad actual debe ser mayor o igual a 0');
      return;
    }
    if (this.formLote.costoCompra === undefined || this.formLote.costoCompra === null || this.formLote.costoCompra < 0) {
      alert('El costo de compra debe ser mayor o igual a 0');
      return;
    }

    // Convertir a tipo numérico correcto
    this.formLote.productoId = Number(this.formLote.productoId);

    this.loteService.crearLote(this.formLote).subscribe({
      next: (res) => {
        alert(`Lote ${res.numeroLote} registrado con éxito.`);
        
        // Refrescar el listado si corresponde
        if (this.queryMode === 'PRODUCTO' && this.selectedProductoId === res.productoId) {
          this.cargarLotesPorProducto();
        } else if (this.queryMode.startsWith('VENCIMIENTO')) {
          this.onQueryModeChange();
        }

        // Limpiar form
        this.formLote = {
          empresaId: 0,
          productoId: 0,
          numeroLote: '',
          fechaFabricacion: undefined,
          fechaVencimiento: undefined,
          cantidadActual: 0,
          costoCompra: 0
        };
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error al registrar el lote.');
      }
    });
  }

  // --- Helper Methods para el Semáforo de Vencimiento ---

  calcularDiasRestantes(fechaVencimiento?: string): number | null {
    if (!fechaVencimiento) return null;
    const expDate = new Date(fechaVencimiento + 'T00:00:00');
    const today = new Date();
    // Resetear horas
    today.setHours(0,0,0,0);
    expDate.setHours(0,0,0,0);
    
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  esCritico(fechaVencimiento?: string): boolean {
    const dias = this.calcularDiasRestantes(fechaVencimiento);
    return dias !== null && dias < 30;
  }

  esAdvertencia(fechaVencimiento?: string): boolean {
    const dias = this.calcularDiasRestantes(fechaVencimiento);
    return dias !== null && dias >= 30 && dias <= 60;
  }

  getSemaforoClase(fechaVencimiento?: string): string {
    const dias = this.calcularDiasRestantes(fechaVencimiento);
    if (dias === null) return 'gray';
    if (dias < 0) return 'gray'; // Vencido
    if (dias < 30) return 'red';
    if (dias <= 60) return 'yellow';
    return 'green';
  }

  getSemaforoTextoClase(fechaVencimiento?: string): string {
    const dias = this.calcularDiasRestantes(fechaVencimiento);
    if (dias === null) return 'text-gray';
    if (dias < 0) return 'text-gray';
    if (dias < 30) return 'text-red';
    if (dias <= 60) return 'text-yellow';
    return 'text-green';
  }

  getSemaforoLeyenda(fechaVencimiento?: string): string {
    const dias = this.calcularDiasRestantes(fechaVencimiento);
    if (dias === null) return 'Sin vencimiento';
    if (dias < 0) return 'Lote Vencido';
    if (dias === 0) return 'Vence hoy';
    if (dias < 30) return `Vence en ${dias}d (Urgente)`;
    if (dias <= 60) return `Vence en ${dias}d`;
    return `Seguro: ${dias}d`;
  }
}
