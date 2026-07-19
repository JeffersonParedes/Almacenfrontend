import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials = { usuario: '', contrasena: '' };

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        const payload = this.authService.currentUserValue;
        if (payload) {
          if (payload.rol === 'ADMINISTRADOR') {
            this.router.navigate(['/administrador/dashboard']);
          } else if (payload.rol === 'BODEGUERO') {
            this.router.navigate(['/bodeguero/dashboard']);
          } else if (payload.rol === 'EMPLEADO') {
            this.router.navigate(['/empleado']);
          } else {
            this.router.navigate(['/login']);
          }
        }
      },
      error: (err) => {
        this.authService.logout();
        alert('Credenciales incorrectas o empresa suspendida');
      }
    });
  }
}