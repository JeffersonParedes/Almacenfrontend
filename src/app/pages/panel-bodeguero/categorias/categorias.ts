import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { CategoriaService } from '../../../services/categoria';

// Models
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-bodeguero-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];
  pagedCategorias: Categoria[] = [];

  // Form State
  formCategoria: Categoria = { nombre: '', descripcion: '' };
  editMode = false;
  editingId?: number;

  // Search & Pagination State
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  startIndex = 0;
  endIndex = 0;

  constructor(private categoriaService: CategoriaService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.listarTodas().subscribe({
      next: (data) => {
        this.categorias = data;
        this.filtrarYPaginar();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  filtrarYPaginar() {
    // 1. Búsqueda
    if (!this.searchTerm.trim()) {
      this.filteredCategorias = [...this.categorias];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredCategorias = this.categorias.filter(c => 
        c.nombre.toLowerCase().includes(term) || 
        (c.descripcion && c.descripcion.toLowerCase().includes(term))
      );
    }

    // 2. Límites
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredCategorias.length);

    // 3. Paginación
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

  // --- CRUD & Aprobación ---

  guardar() {
    if (!this.formCategoria.nombre.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    if (this.editMode && this.editingId) {
      // Editar
      this.categoriaService.actualizarCategoria(this.editingId, this.formCategoria).subscribe({
        next: () => {
          alert('Categoría actualizada con éxito.');
          this.cancelarEdicion();
          this.cargarCategorias();
        },
        error: () => alert('Error al actualizar la categoría.')
      });
    } else {
      // Crear directamente
      this.categoriaService.registrarCategoria(this.formCategoria).subscribe({
        next: () => {
          alert('Categoría creada con éxito.');
          this.formCategoria = { nombre: '', descripcion: '' };
          this.cargarCategorias();
        this.cdRef.detectChanges();
        },
        error: () => alert('Error al registrar la categoría.')
      });
    }
  }

  seleccionarParaEdicion(cat: Categoria) {
    this.editMode = true;
    this.editingId = cat.id;
    this.formCategoria = {
      nombre: cat.nombre,
      descripcion: cat.descripcion
    };
  }

  cancelarEdicion() {
    this.editMode = false;
    this.editingId = undefined;
    this.formCategoria = { nombre: '', descripcion: '' };
  }

  eliminar(id?: number) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar esta categoría? Si tiene productos asociados podría fallar.')) {
      this.categoriaService.eliminarCategoria(id).subscribe({
        next: () => {
          alert('Categoría eliminada.');
          this.cargarCategorias();
        },
        error: () => alert('No se puede eliminar la categoría. Puede estar referenciada en productos.')
      });
    }
  }

  aprobar(id?: number) {
    if (!id) return;
    this.categoriaService.aprobarCategoria(id).subscribe({
      next: () => {
        alert('Categoría aprobada.');
        this.cargarCategorias();
      },
      error: () => alert('Error al aprobar la categoría.')
    });
  }

  rechazar(id?: number) {
    if (!id) return;
    if (confirm('¿Estás seguro de rechazar esta categoría?')) {
      this.categoriaService.rechazarCategoria(id).subscribe({
        next: () => {
          alert('Categoría rechazada.');
          this.cargarCategorias();
        },
        error: () => alert('Error al rechazar la categoría.')
      });
    }
  }
}