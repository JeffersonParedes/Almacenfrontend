import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { ProductoService } from '../../../services/producto';
import { CategoriaService } from '../../../services/categoria';
import { SolicitudService } from '../../../services/solicitud.service';
import { AuthService } from '../../../services/auth';

// Models
import { Producto } from '../../../models/producto';
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-empleado-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class EmpleadoProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  filteredProductos: Producto[] = [];
  pagedProductos: Producto[] = [];

  // Search & Pagination
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 0;

  // Modals
  showSugerirModal = false;
  showEditarModal = false;

  // Form states
  formSugerencia: Producto = {
    nombre: '',
    precio: 0,
    categoriaId: undefined,
    codigoBarras: '',
    descripcion: ''
  };

  selectedProductForEdit?: Producto;
  editProposal: {
    id?: number;
    nombre: string;
    precio: number;
  } = {
    nombre: '',
    precio: 0
  };
  editReason = '';

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.listarActivos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
        this.filtrarYPaginar();
      },
      error: (err: any) => console.error('Error al cargar catálogo de productos:', err)
    });
  }

  cargarCategorias() {
    this.categoriaService.listarActivas().subscribe({
      next: (data: Categoria[]) => this.categorias = data,
      error: (err: any) => console.error('Error al cargar categorías activas:', err)
    });
  }

  filtrarYPaginar() {
    if (!this.searchTerm.trim()) {
      this.filteredProductos = [...this.productos];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredProductos = this.productos.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        (p.codigoBarras && p.codigoBarras.toLowerCase().includes(term)) || 
        (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(term))
      );
    }

    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredProductos.length);
    this.pagedProductos = this.filteredProductos.slice(this.startIndex, this.endIndex);
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
    if (this.endIndex < this.filteredProductos.length) {
      this.currentPage++;
      this.filtrarYPaginar();
    }
  }

  // --- Modal control ---

  abrirModalSugerir() {
    this.showSugerirModal = true;
    this.formSugerencia = {
      nombre: '',
      precio: 0,
      categoriaId: undefined,
      codigoBarras: '',
      descripcion: ''
    };
  }

  cerrarModalSugerir() {
    this.showSugerirModal = false;
  }

  abrirModalEditar(prod: Producto) {
    if (!prod.id) return;
    this.selectedProductForEdit = prod;
    this.editProposal = {
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio
    };
    this.editReason = '';
    this.showEditarModal = true;
  }

  cerrarModalEditar() {
    this.showEditarModal = false;
  }

  // --- Operaciones ---

  sugerirProducto() {
    if (!this.formSugerencia.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!this.formSugerencia.categoriaId) {
      alert('La categoría es obligatoria');
      return;
    }
    if (this.formSugerencia.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    const payload = this.authService.currentUserValue;
    if (!payload || !payload.usuarioId) {
      alert('Sesión no válida.');
      return;
    }

    // Castear id
    this.formSugerencia.categoriaId = Number(this.formSugerencia.categoriaId);

    // 1. Guardar como pendiente
    this.productoService.registrarProducto(this.formSugerencia).subscribe({
      next: (res: Producto) => {
        if (!res.id) return;
        
        // 2. Crear solicitud
        this.solicitudService.crearSolicitud({
          empresaId: Number(payload.empresaId),
          usuarioId: Number(payload.usuarioId),
          tipo: 'PRODUCTO',
          referenciaId: res.id,
          observacion: `Solicitud de creación para producto: ${res.nombre}`
        }).subscribe({
          next: () => {
            alert('Sugerencia enviada correctamente. Se ha generado una solicitud de aprobación.');
            this.cerrarModalSugerir();
            this.cargarProductos();
          },
          error: (err: any) => {
            console.error('Error al generar solicitud:', err);
            alert('Producto creado como pendiente, pero falló el registro de la solicitud.');
            this.cerrarModalSugerir();
            this.cargarProductos();
          }
        });
      },
      error: (err: any) => {
        console.error(err);
        alert(err.error?.message || 'Error al guardar el producto sugerido.');
      }
    });
  }

  enviarModificacion() {
    if (!this.editProposal.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (this.editProposal.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }
    if (!this.editReason.trim()) {
      alert('Debe indicar una observación para justificar el cambio');
      return;
    }

    if (!this.editProposal.id) return;

    const payload = this.authService.currentUserValue;
    if (!payload || !payload.usuarioId) {
      alert('Sesión no válida.');
      return;
    }

    this.solicitudService.crearSolicitud({
      empresaId: Number(payload.empresaId),
      usuarioId: Number(payload.usuarioId),
      tipo: 'PRODUCTO',
      referenciaId: this.editProposal.id,
      observacion: `Solicitud de MODIFICACIÓN para producto (ID: ${this.editProposal.id}). Cambios propuestos: Nombre: "${this.editProposal.nombre}", Precio: S/. ${this.editProposal.precio}. Observación: ${this.editReason}`
    }).subscribe({
      next: () => {
        alert('Solicitud de modificación enviada correctamente al Bodeguero.');
        this.cerrarModalEditar();
        this.cargarProductos();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al generar la solicitud de modificación.');
      }
    });
  }

  solicitarEliminacion(prod: Producto) {
    if (!prod.id) return;
    
    const reason = prompt(`Indique el motivo por el cual solicita la ELIMINACIÓN del producto "${prod.nombre}":`);
    if (reason === null) return; // Canceló

    if (!reason.trim()) {
      alert('Debe proporcionar un motivo para solicitar la eliminación.');
      return;
    }

    const payload = this.authService.currentUserValue;
    if (!payload || !payload.usuarioId) {
      alert('Sesión no válida.');
      return;
    }

    this.solicitudService.crearSolicitud({
      empresaId: Number(payload.empresaId),
      usuarioId: Number(payload.usuarioId),
      tipo: 'PRODUCTO',
      referenciaId: prod.id,
      observacion: `Solicitud de ELIMINACIÓN para producto "${prod.nombre}" (ID: ${prod.id}). Motivo: ${reason}`
    }).subscribe({
      next: () => {
        alert('Solicitud de eliminación enviada al Bodeguero.');
        this.cargarProductos();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al registrar la solicitud de eliminación.');
      }
    });
  }
}
