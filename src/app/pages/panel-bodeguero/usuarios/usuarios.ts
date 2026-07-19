import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { UsuarioService } from '../../../services/usuario';

// Models
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-bodeguero-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  pagedUsuarios: Usuario[] = [];

  // Form State
  formUsuario: Usuario = {
    usuario: '',
    contrasena: '',
    correo: '',
    nombreCompleto: '',
    rol: 'EMPLEADO',
    activo: true
  };
  editMode = false;
  editingId?: number;

  // Search & Pagination State
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  startIndex = 0;
  endIndex = 0;

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.listarPorEmpresa().subscribe({
      next: (data) => {
        // Filtrar para mostrar solo los empleados creados por el Bodeguero (con rol EMPLEADO)
        this.usuarios = data.filter(u => u.rol === 'EMPLEADO');
        this.filtrarYPaginar();
      },
      error: (err) => console.error('Error al cargar empleados:', err)
    });
  }

  filtrarYPaginar() {
    if (!this.searchTerm.trim()) {
      this.filteredUsuarios = [...this.usuarios];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredUsuarios = this.usuarios.filter(u => 
        u.nombreCompleto.toLowerCase().includes(term) || 
        u.usuario.toLowerCase().includes(term) || 
        (u.correo && u.correo.toLowerCase().includes(term))
      );
    }

    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredUsuarios.length);
    this.pagedUsuarios = this.filteredUsuarios.slice(this.startIndex, this.endIndex);
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
    if (this.endIndex < this.filteredUsuarios.length) {
      this.currentPage++;
      this.filtrarYPaginar();
    }
  }

  // --- CRUD ---

  guardar() {
    if (!this.formUsuario.nombreCompleto.trim()) {
      alert('El nombre completo es obligatorio');
      return;
    }
    if (!this.formUsuario.correo || !this.formUsuario.correo.trim()) {
      alert('El correo electrónico es obligatorio');
      return;
    }
    if (!this.formUsuario.usuario.trim()) {
      alert('El nombre de usuario es obligatorio');
      return;
    }

    if (this.editMode && this.editingId) {
      // Si estamos editando y dejamos la contraseña vacía, enviamos undefined o mantenemos la misma
      const payload = { ...this.formUsuario };
      if (!payload.contrasena || !payload.contrasena.trim()) {
        delete payload.contrasena;
      }
      
      this.usuarioService.actualizarUsuario(this.editingId, payload).subscribe({
        next: () => {
          alert('Empleado actualizado con éxito.');
          this.cancelarEdicion();
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Error al actualizar el empleado.');
        }
      });
    } else {
      // Crear
      if (!this.formUsuario.contrasena || !this.formUsuario.contrasena.trim()) {
        alert('La contraseña es obligatoria para nuevos empleados');
        return;
      }

      this.usuarioService.crearUsuario(this.formUsuario).subscribe({
        next: () => {
          alert('Empleado creado con éxito.');
          this.formUsuario = {
            usuario: '',
            contrasena: '',
            correo: '',
            nombreCompleto: '',
            rol: 'EMPLEADO',
            activo: true
          };
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Error al crear el empleado. El usuario puede estar en uso.');
        }
      });
    }
  }

  seleccionarParaEdicion(user: Usuario) {
    this.editMode = true;
    this.editingId = user.id;
    this.formUsuario = {
      usuario: user.usuario,
      contrasena: '', // Vacío por seguridad
      correo: user.correo,
      nombreCompleto: user.nombreCompleto,
      rol: 'EMPLEADO',
      activo: user.activo
    };
  }

  cancelarEdicion() {
    this.editMode = false;
    this.editingId = undefined;
    this.formUsuario = {
      usuario: '',
      contrasena: '',
      correo: '',
      nombreCompleto: '',
      rol: 'EMPLEADO',
      activo: true
    };
  }

  toggleEstado(user: Usuario) {
    if (!user.id) return;
    const action$ = user.activo 
      ? this.usuarioService.desactivarUsuario(user.id)
      : this.usuarioService.activarUsuario(user.id);

    action$.subscribe({
      next: () => {
        alert(`Empleado ${user.activo ? 'desactivado' : 'activado'} con éxito.`);
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error(err);
        alert('Error al modificar el estado del empleado.');
      }
    });
  }
}
