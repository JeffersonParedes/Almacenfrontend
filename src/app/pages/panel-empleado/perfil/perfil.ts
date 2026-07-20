import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { AuthService } from '../../../services/auth';
import { UsuarioService } from '../../../services/usuario';

// Models
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-empleado-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class EmpleadoPerfilComponent implements OnInit {
  userData: Usuario | null = null;
  formProfile: Usuario = {
    usuario: '',
    correo: '',
    nombreCompleto: '',
    rol: 'EMPLEADO',
    activo: true
  };
  initials = 'EM';

  // Password fields
  newPassword = '';
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    const userPayload = this.authService.currentUserValue;
    if (!userPayload || !userPayload.usuarioId) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = Number(userPayload.usuarioId);

    this.usuarioService.obtenerPorId(userId).subscribe({
      next: (data) => {
        this.userData = data;
        this.formProfile = {
          id: data.id,
          usuario: data.usuario,
          correo: data.correo,
          nombreCompleto: data.nombreCompleto,
          rol: data.rol,
          activo: data.activo,
          empresaId: data.empresaId
        };
        
        if (data.nombreCompleto) {
          const names = data.nombreCompleto.split(' ');
          this.initials = names.slice(0, 2).map(n => n.charAt(0).toUpperCase()).join('');
        }
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar perfil de Empleado:', err)
    });
  }

  actualizarPerfil() {
    if (!this.userData || !this.userData.id) return;

    if (!this.formProfile.nombreCompleto.trim()) {
      alert('El nombre completo es obligatorio');
      return;
    }
    if (!this.formProfile.correo || !this.formProfile.correo.trim()) {
      alert('El correo electrónico es obligatorio');
      return;
    }
    if (!this.formProfile.usuario.trim()) {
      alert('El nombre de usuario es obligatorio');
      return;
    }

    // Clonar para el envío
    const payload = { ...this.formProfile };

    // Validar cambio de contraseña si se ha digitado algo
    if (this.newPassword || this.confirmPassword) {
      if (this.newPassword !== this.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      if (this.newPassword.length < 4) {
        alert('La contraseña debe tener al menos 4 caracteres');
        return;
      }
      payload.contrasena = this.newPassword;
    } else {
      delete payload.contrasena;
    }

    this.usuarioService.actualizarUsuario(this.userData.id, payload).subscribe({
      next: (res) => {
        alert('Perfil actualizado con éxito.');
        this.newPassword = '';
        this.confirmPassword = '';
        this.cargarPerfil();
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error al actualizar el perfil.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}