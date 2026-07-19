import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { ReporteService } from '../../../services/reporte.service';
import { AlmacenService } from '../../../services/almacen';
import { CategoriaService } from '../../../services/categoria';

// Models
import { Almacen } from '../../../models/almacen';
import { Categoria } from '../../../models/categoria';
import { ReporteInventarioRequest, ReporteMovimientoRequest, ReporteProductoRequest } from '../../../models/reporte';

@Component({
  selector: 'app-bodeguero-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit {
  almacenes: Almacen[] = [];
  categorias: Categoria[] = [];

  // Filter Models
  inventarioFiltros: ReporteInventarioRequest = {
    almacenId: undefined
  };

  movimientoFiltros: ReporteMovimientoRequest = {
    almacenId: undefined,
    fechaInicio: '',
    fechaFin: ''
  };

  productoFiltros: ReporteProductoRequest = {
    categoriaId: undefined,
    estadoAprobacion: ''
  };

  // Loading Flags
  loadingInventario = false;
  loadingMovimientos = false;
  loadingProductos = false;
  loadingDashboard = false;

  constructor(
    private reporteService: ReporteService,
    private almacenService: AlmacenService,
    private categoriaService: CategoriaService
  ) { }

  ngOnInit() {
    this.cargarAlmacenes();
    this.cargarCategorias();
  }

  cargarAlmacenes() {
    this.almacenService.getAlmacenes().subscribe({
      next: (data) => this.almacenes = data.filter(a => a.activo !== false),
      error: (err) => console.error('Error al cargar almacenes para filtros de reportes:', err)
    });
  }

  cargarCategorias() {
    this.categoriaService.listarActivas().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error al cargar categorías para filtros de reportes:', err)
    });
  }

  generarInventario() {
    this.loadingInventario = true;
    // Cast proper numbers if they are bound as strings from the html dropdown selection
    const request = { ...this.inventarioFiltros };
    if (request.almacenId) request.almacenId = Number(request.almacenId);

    this.reporteService.generarInventario(request).subscribe({
      next: (res) => {
        this.reporteService.descargarPdf(res);
        this.loadingInventario = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar el reporte de inventario.');
        this.loadingInventario = false;
      }
    });
  }

  generarMovimientos() {
    this.loadingMovimientos = true;
    const request = { ...this.movimientoFiltros };
    if (request.almacenId) request.almacenId = Number(request.almacenId);
    if (!request.fechaInicio) delete request.fechaInicio;
    if (!request.fechaFin) delete request.fechaFin;

    this.reporteService.generarMovimientos(request).subscribe({
      next: (res) => {
        this.reporteService.descargarPdf(res);
        this.loadingMovimientos = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar el reporte de movimientos.');
        this.loadingMovimientos = false;
      }
    });
  }

  generarProductos() {
    this.loadingProductos = true;
    const request = { ...this.productoFiltros };
    if (request.categoriaId) request.categoriaId = Number(request.categoriaId);
    if (!request.estadoAprobacion) delete request.estadoAprobacion;

    this.reporteService.generarProductos(request).subscribe({
      next: (res) => {
        this.reporteService.descargarPdf(res);
        this.loadingProductos = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar el reporte de catálogo.');
        this.loadingProductos = false;
      }
    });
  }

  generarDashboard() {
    this.loadingDashboard = true;
    this.reporteService.generarDashboard().subscribe({
      next: (res) => {
        this.reporteService.descargarPdf(res);
        this.loadingDashboard = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar el reporte ejecutivo.');
        this.loadingDashboard = false;
      }
    });
  }
}
