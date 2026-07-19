import { Component, OnInit } from '@angular/core';
import { AuthService, UserTokenPayload } from '../../../services/auth';

@Component({
  selector: 'app-administrador-perfil',
  standalone: true,
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class AdministradorPerfilComponent implements OnInit {
  payload: UserTokenPayload | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.payload = this.authService.currentUserValue;
  }

  getInitials(): string {
    return this.payload?.sub ? this.payload.sub.substring(0, 2).toUpperCase() : 'AD';
  }

  getExpirationDate(): string {
    if (this.payload?.exp) {
      const expDate = new Date(this.payload.exp * 1000);
      return expDate.toLocaleString();
    }
    return 'N/A';
  }
}
