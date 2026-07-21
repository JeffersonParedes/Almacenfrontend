import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { LoteService } from '../../../services/lote.service';
import { ProductoService } from '../../../services/producto';
import { AlmacenService } from '../../../services/almacen';

// Models
import { LoteRequest, LoteResponse } from '../../../models/lote';
import { Producto } from '../../../models/producto';
import { Almacen } from '../../../models/almacen';

@Component({
  selector: 'app-bodeguero-lotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lotes.html',
  styleUrl: './lotes.css'
})
export class LotesComponent implements OnInit {
  productosAprobados: Producto[] = [];
  almacenes: Almacen[] = [];
  lotes: LoteResponse[] = [];

  fechaHoyStr: string = new Date().toISOString().split('T')[0];

  // Form State
  formLote: LoteRequest = {
    empresaId: 0,
    productoId: 0,
    almacenId: undefined,
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
    private productoService: ProductoService,
    private almacenService: AlmacenService
  ) { }

  ngOnInit() {
    this.cargarProductosAprobados();
    this.cargarAlmacenes();
  }

  cargarProductosAprobados() {
    this.productoService.listarActivos().subscribe({
      next: (prods) => {
        this.productosAprobados = prods.filter(p => p.estadoAprobacion === 'APROBADO' || p.estadoAprobacion === 'APROBADA');
      },
      error: (err) => console.error('Error al cargar productos para lotes:', err)
    });
  }

  cargarAlmacenes() {
    this.almacenService.getAlmacenes().subscribe({
      next: (alms) => {
        this.almacenes = alms.filter(a => a.activo !== false);
        if (this.almacenes.length > 0 && !this.formLote.almacenId) {
          this.formLote.almacenId = this.almacenes[0].id;
        }
      },
      error: (err) => console.error('Error al cargar almacenes para lotes:', err)
    });
  }

  onProductoRegistroChange() {
    if (!this.formLote.productoId) return;
    const selectedProd = this.productosAprobados.find(p => p.id === Number(this.formLote.productoId));
    if (selectedProd) {
      this.formLote.costoCompra = selectedProd.precio || 0;
    }
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
      alert('Debe seleccionar un producto del catálogo.');
      return;
    }
    if (!this.formLote.almacenId) {
      alert('Debe seleccionar un almacén de destino.');
      return;
    }
    const numLote = (this.formLote.numeroLote || '').trim();
    if (!numLote) {
      alert('El número de lote es obligatorio.');
      return;
    }

    // Validar fecha de vencimiento no menor a fecha actual
    if (this.formLote.fechaVencimiento) {
      const fechaVenc = new Date(this.formLote.fechaVencimiento + 'T00:00:00');
      const hoy = new Date();
      hoy.setHours(0,0,0,0);
      fechaVenc.setHours(0,0,0,0);

      if (fechaVenc < hoy) {
        alert('La fecha de vencimiento no puede ser menor a la fecha actual.');
        return;
      }
    }

    // Validar cantidad inicial: entero positivo
    const cant = Number(this.formLote.cantidadActual);
    if (isNaN(cant) || cant <= 0 || !Number.isInteger(cant)) {
      alert('La cantidad inicial debe ser un número entero mayor a cero.');
      return;
    }

    this.formLote.productoId = Number(this.formLote.productoId);
    this.formLote.almacenId = Number(this.formLote.almacenId);
    this.formLote.numeroLote = numLote;

    this.loteService.crearLote(this.formLote).subscribe({
      next: (res) => {
        alert(`Lote ${res.numeroLote} registrado con éxito y guardado en inventario.`);
        
        if (this.queryMode === 'PRODUCTO' && this.selectedProductoId === res.productoId) {
          this.cargarLotesPorProducto();
        } else if (this.queryMode.startsWith('VENCIMIENTO')) {
          this.onQueryModeChange();
        }

        this.formLote = {
          empresaId: 0,
          productoId: 0,
          almacenId: this.almacenes.length > 0 ? this.almacenes[0].id : undefined,
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
    if (dias < 0) return 'gray';
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