import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  confirmarContrasena: string = '';

  // Form State
  formUsuario: Usuario = {
    usuario: '',
    contrasena: '',
    correo: '',
    dni: '',
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

  constructor(private usuarioService: UsuarioService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.listarPorEmpresa().subscribe({
      next: (data) => {
        this.usuarios = data.filter(u => u.rol === 'EMPLEADO');
        this.filtrarYPaginar();
        this.cdRef.detectChanges();
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
        (u.correo && u.correo.toLowerCase().includes(term)) ||
        (u.dni && u.dni.toLowerCase().includes(term))
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
    const nombre = this.formUsuario.nombreCompleto.trim();
    const usuario = this.formUsuario.usuario.trim();
    const correo = (this.formUsuario.correo || '').trim();
    const dni = (this.formUsuario.dni || '').trim();
    const contrasena = this.formUsuario.contrasena || '';

    if (!nombre) {
      alert('El nombre completo es obligatorio.');
      return;
    }
    if (!correo) {
      alert('El correo electrónico es obligatorio.');
      return;
    }
    if (!usuario) {
      alert('El nombre de usuario es obligatorio.');
      return;
    }
    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
      alert('El DNI debe ser numérico y contener exactamente 8 dígitos.');
      return;
    }

    if (!this.editMode) {
      if (!contrasena || contrasena.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (contrasena !== this.confirmarContrasena) {
        alert('Las contraseñas no coinciden.');
        return;
      }
    } else {
      if (contrasena && contrasena.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (contrasena && contrasena !== this.confirmarContrasena) {
        alert('Las contraseñas no coinciden.');
        return;
      }
    }

    this.formUsuario.nombreCompleto = nombre;
    this.formUsuario.usuario = usuario;
    this.formUsuario.correo = correo;
    this.formUsuario.dni = dni;

    if (this.editMode && this.editingId) {
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
      this.usuarioService.crearUsuario(this.formUsuario).subscribe({
        next: () => {
          alert('Empleado creado con éxito.');
          this.cancelarEdicion();
          this.cargarUsuarios();
          this.cdRef.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'El nombre de usuario o correo ya se encuentra registrado.');
        }
      });
    }
  }

  seleccionarParaEdicion(user: Usuario) {
    this.editMode = true;
    this.editingId = user.id;
    this.formUsuario = {
      usuario: user.usuario,
      contrasena: '',
      correo: user.correo,
      dni: user.dni || '',
      nombreCompleto: user.nombreCompleto,
      rol: 'EMPLEADO',
      activo: user.activo
    };
    this.confirmarContrasena = '';
  }

  cancelarEdicion() {
    this.editMode = false;
    this.editingId = undefined;
    this.formUsuario = {
      usuario: '',
      contrasena: '',
      correo: '',
      dni: '',
      nombreCompleto: '',
      rol: 'EMPLEADO',
      activo: true
    };
    this.confirmarContrasena = '';
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
        alert(err.error?.message || 'Error al modificar el estado del empleado.');
      }
    });
  }
}