import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { ProductoService } from '../../../services/producto';
import { CategoriaService } from '../../../services/categoria';

// Models
import { Producto } from '../../../models/producto';
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-bodeguero-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  pagedProductos: Producto[] = [];
  categoriasActivas: Categoria[] = [];

  // Form State
  formProducto: Producto = { nombre: '', precio: 0, categoriaId: undefined };
  editMode = false;
  editingId?: number;

  // Search & Pagination State
  searchTerm = '';
  selectedCategoryFilter = '';
  currentPage = 1;
  pageSize = 5;
  startIndex = 0;
  endIndex = 0;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) { }

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.listarActivos().subscribe({
      next: (data) => {
        this.productos = data;
        this.filtrarYPaginar();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  cargarCategorias() {
    this.categoriaService.listarActivas().subscribe({
      next: (data) => {
        this.categoriasActivas = data;
      },
      error: (err) => console.error('Error al cargar categorías activas:', err)
    });
  }

  filtrarYPaginar() {
    // 1. Filtrar búsqueda y categoría
    this.filteredProductos = this.productos.filter(p => {
      const matchSearch = !this.searchTerm.trim() || 
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase().trim()) || 
        (p.codigoBarras && p.codigoBarras.toLowerCase().includes(this.searchTerm.toLowerCase().trim()));
        
      const matchCategory = !this.selectedCategoryFilter || 
        (p.categoria?.id?.toString() === this.selectedCategoryFilter) ||
        (p.categoriaId?.toString() === this.selectedCategoryFilter);
        
      return matchSearch && matchCategory;
    });

    // 2. Límites
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredProductos.length);

    // 3. Paginación
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

  // --- CRUD ---

  guardar() {
    if (!this.formProducto.nombre.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }
    if (this.formProducto.precio === undefined || this.formProducto.precio === null || this.formProducto.precio < 0) {
      alert('El precio debe ser un número válido mayor o igual a 0');
      return;
    }
    if (!this.formProducto.categoriaId) {
      alert('Debe seleccionar una categoría para el producto');
      return;
    }

    // Convertir de string a number si es necesario (el binding HTML a veces guarda ids como string)
    this.formProducto.categoriaId = Number(this.formProducto.categoriaId);

    if (this.editMode && this.editingId) {
      // Editar
      this.productoService.actualizarProducto(this.editingId, this.formProducto).subscribe({
        next: () => {
          alert('Producto actualizado con éxito.');
          this.cancelarEdicion();
          this.cargarProductos();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Error al actualizar el producto.');
        }
      });
    } else {
      // Crear directamente (Bodeguero crea con estado APROBADO)
      this.productoService.registrarProducto(this.formProducto).subscribe({
        next: () => {
          alert('Producto creado con éxito.');
          this.formProducto = { nombre: '', precio: 0, categoriaId: undefined };
          this.cargarProductos();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Error al crear el producto.');
        }
      });
    }
  }

  seleccionarParaEdicion(prod: Producto) {
    this.editMode = true;
    this.editingId = prod.id;
    this.formProducto = {
      nombre: prod.nombre,
      codigoBarras: prod.codigoBarras,
      precio: prod.precio,
      categoriaId: prod.categoria?.id || prod.categoriaId,
      descripcion: prod.descripcion,
      imagenUrl: prod.imagenUrl
    };
  }

  cancelarEdicion() {
    this.editMode = false;
    this.editingId = undefined;
    this.formProducto = { nombre: '', precio: 0, categoriaId: undefined };
  }

  eliminar(id?: number) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este producto del catálogo? Se realizará un borrado lógico.')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          alert('Producto eliminado (borrado lógico).');
          this.cargarProductos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar el producto.');
        }
      });
    }
  }

  aprobar(id?: number) {
    if (!id) return;
    this.productoService.aprobarProducto(id).subscribe({
      next: () => {
        alert('Producto aprobado en el catálogo.');
        this.cargarProductos();
      },
      error: (err) => alert('Error al aprobar el producto.')
    });
  }

  rechazar(id?: number) {
    if (!id) return;
    if (confirm('¿Estás seguro de rechazar este producto?')) {
      this.productoService.rechazarProducto(id).subscribe({
        next: () => {
          alert('Producto rechazado.');
          this.cargarProductos();
        },
        error: (err) => alert('Error al rechazar el producto.')
      });
    }
  }
}
