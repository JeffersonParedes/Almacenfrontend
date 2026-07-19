import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { CategoriaService } from '../../../services/categoria';
import { SolicitudService } from '../../../services/solicitud.service';
import { AuthService } from '../../../services/auth';

// Models
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-empleado-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class EmpleadoCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];
  pagedCategorias: Categoria[] = [];

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
  formSugerencia: Categoria = {
    nombre: '',
    descripcion: ''
  };

  selectedCategoryForEdit?: Categoria;
  editProposal: {
    id?: number;
    nombre: string;
  } = {
    nombre: ''
  };
  editReason = '';

  constructor(
    private categoriaService: CategoriaService,
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.listarTodas().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        this.filtrarYPaginar();
      },
      error: (err: any) => console.error('Error al cargar categorías:', err)
    });
  }

  filtrarYPaginar() {
    if (!this.searchTerm.trim()) {
      this.filteredCategorias = [...this.categorias];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredCategorias = this.categorias.filter(c => 
        c.nombre.toLowerCase().includes(term) || 
        (c.descripcion && c.descripcion.toLowerCase().includes(term))
      );
    }

    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredCategorias.length);
    this.pagedCategorias = this.filteredCategorias.slice(this.startIndex, this.endIndex);
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
    if (this.endIndex < this.filteredCategorias.length) {
      this.currentPage++;
      this.filtrarYPaginar();
    }
  }

  // --- Modals ---

  abrirModalSugerir() {
    this.showSugerirModal = true;
    this.formSugerencia = {
      nombre: '',
      descripcion: ''
    };
  }

  cerrarModalSugerir() {
    this.showSugerirModal = false;
  }

  abrirModalEditar(cat: Categoria) {
    if (!cat.id) return;
    this.selectedCategoryForEdit = cat;
    this.editProposal = {
      id: cat.id,
      nombre: cat.nombre
    };
    this.editReason = '';
    this.showEditarModal = true;
  }

  cerrarModalEditar() {
    this.showEditarModal = false;
  }

  // --- Operaciones ---

  sugerirCategoria() {
    if (!this.formSugerencia.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    const payload = this.authService.currentUserValue;
    if (!payload || !payload.usuarioId) {
      alert('Sesión no válida.');
      return;
    }

    this.categoriaService.registrarCategoria(this.formSugerencia).subscribe({
      next: (res: Categoria) => {
        if (!res.id) return;

        this.solicitudService.crearSolicitud({
          empresaId: Number(payload.empresaId),
          usuarioId: Number(payload.usuarioId),
          tipo: 'CATEGORIA',
          referenciaId: res.id,
          observacion: `Solicitud de aprobación para categoría: ${res.nombre}`
        }).subscribe({
          next: () => {
            alert('Sugerencia de categoría enviada correctamente.');
            this.cerrarModalSugerir();
            this.cargarCategorias();
          },
          error: (err: any) => {
            console.error('Error al generar solicitud de categoría:', err);
            alert('Categoría sugerida, pero falló el registro de la solicitud.');
            this.cerrarModalSugerir();
            this.cargarCategorias();
          }
        });
      },
      error: (err: any) => {
        console.error(err);
        alert(err.error?.message || 'Error al guardar la sugerencia de categoría.');
      }
    });
  }

  enviarModificacion() {
    if (!this.editProposal.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!this.editReason.trim()) {
      alert('Debe justificar la solicitud de modificación');
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
      tipo: 'CATEGORIA',
      referenciaId: this.editProposal.id,
      observacion: `Solicitud de MODIFICACIÓN para categoría (ID: ${this.editProposal.id}). Cambios propuestos: Nombre: "${this.editProposal.nombre}". Justificación: ${this.editReason}`
    }).subscribe({
      next: () => {
        alert('Solicitud de modificación de categoría enviada.');
        this.cerrarModalEditar();
        this.cargarCategorias();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al generar la solicitud de modificación de categoría.');
      }
    });
  }

  solicitarEliminacion(cat: Categoria) {
    if (!cat.id) return;

    const reason = prompt(`Indique el motivo por el cual solicita la ELIMINACIÓN de la categoría "${cat.nombre}":`);
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
      tipo: 'CATEGORIA',
      referenciaId: cat.id,
      observacion: `Solicitud de ELIMINACIÓN para categoría "${cat.nombre}" (ID: ${cat.id}). Motivo: ${reason}`
    }).subscribe({
      next: () => {
        alert('Solicitud de eliminación de categoría enviada.');
        this.cargarCategorias();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al registrar la solicitud de eliminación.');
      }
    });
  }
}
