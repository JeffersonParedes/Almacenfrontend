import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { AlmacenService } from '../../../services/almacen';

// Models
import { Almacen } from '../../../models/almacen';

@Component({
  selector: 'app-bodeguero-almacenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './almacenes.html',
  styleUrl: './almacenes.css'
})
export class AlmacenesComponent implements OnInit {
  almacenes: Almacen[] = [];
  filteredAlmacenes: Almacen[] = [];
  pagedAlmacenes: Almacen[] = [];

  // Form State
  formAlmacen: Almacen = { nombre: '', direccion: '' };
  formAlmacenActivo = true;
  editMode = false;
  editingId?: number;

  // Search & Pagination State
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  startIndex = 0;
  endIndex = 0;

  constructor(private almacenService: AlmacenService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarAlmacenes();
  }

  cargarAlmacenes() {
    this.almacenService.getAlmacenes().subscribe({
      next: (data) => {
        this.almacenes = data;
        this.filtrarYPaginar();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar almacenes:', err)
    });
  }

  filtrarYPaginar() {
    if (!this.searchTerm.trim()) {
      this.filteredAlmacenes = [...this.almacenes];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredAlmacenes = this.almacenes.filter(a => 
        a.nombre.toLowerCase().includes(term) || 
        (a.direccion && a.direccion.toLowerCase().includes(term))
      );
    }

    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredAlmacenes.length);
    this.pagedAlmacenes = this.filteredAlmacenes.slice(this.startIndex, this.endIndex);
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
    if (this.endIndex < this.filteredAlmacenes.length) {
      this.currentPage++;
      this.filtrarYPaginar();
    }
  }

  // --- CRUD ---

  guardar() {
    const nombre = this.formAlmacen.nombre.trim();
    const direccion = (this.formAlmacen.direccion || '').trim();

    if (!nombre) {
      alert('El nombre del almacén es obligatorio.');
      return;
    }

    // Validar duplicados en vista local previa
    if (!this.editMode) {
      if (this.almacenes.some(a => a.nombre.toLowerCase().trim() === nombre.toLowerCase())) {
        alert('El nombre del almacén ya se encuentra registrado.');
        return;
      }
      if (direccion && this.almacenes.some(a => (a.direccion || '').toLowerCase().trim() === direccion.toLowerCase())) {
        alert('La dirección del almacén ya se encuentra registrada.');
        return;
      }
    }

    if (this.editMode && this.editingId) {
      this.almacenService.actualizarAlmacen(this.editingId, this.formAlmacen).subscribe({
        next: (updated) => {
          const original = this.almacenes.find(a => a.id === this.editingId);
          const originalActivo = original ? original.activo !== false : true;

          if (this.formAlmacenActivo !== originalActivo) {
            const toggle$ = this.formAlmacenActivo 
              ? this.almacenService.activarAlmacen(this.editingId!) 
              : this.almacenService.desactivarAlmacen(this.editingId!);
              
            toggle$.subscribe({
              next: () => {
                alert('Almacén actualizado con éxito.');
                this.cancelarEdicion();
                this.cargarAlmacenes();
              },
              error: (err) => {
                alert(err.error?.message || 'Los datos se actualizaron, pero hubo un error al cambiar el estado.');
                this.cancelarEdicion();
                this.cargarAlmacenes();
              }
            });
          } else {
            alert('Almacén actualizado con éxito.');
            this.cancelarEdicion();
            this.cargarAlmacenes();
          }
        },
        error: (err) => alert(err.error?.message || 'Error al actualizar el almacén.')
      });
    } else {
      this.almacenService.crearAlmacen(this.formAlmacen).subscribe({
        next: () => {
          alert('Almacén creado con éxito.');
          this.formAlmacen = { nombre: '', direccion: '' };
          this.cargarAlmacenes();
          this.cdRef.detectChanges();
        },
        error: (err) => alert(err.error?.message || 'Error al crear el almacén.')
      });
    }
  }

  seleccionarParaEdicion(almacen: Almacen) {
    this.editMode = true;
    this.editingId = almacen.id;
    this.formAlmacen = {
      nombre: almacen.nombre,
      direccion: almacen.direccion
    };
    this.formAlmacenActivo = almacen.activo !== false;
  }

  cancelarEdicion() {
    this.editMode = false;
    this.editingId = undefined;
    this.formAlmacen = { nombre: '', direccion: '' };
    this.formAlmacenActivo = true;
  }

  eliminar(id?: number) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este almacén? Esta acción es irreversible.')) {
      this.almacenService.eliminarAlmacen(id).subscribe({
        next: () => {
          alert('Almacén eliminado.');
          this.cargarAlmacenes();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'No se puede eliminar el almacén. Puede que contenga existencias o esté referenciado en el Kardex.');
        }
      });
    }
  }
}