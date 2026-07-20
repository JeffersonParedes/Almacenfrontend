import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserTokenPayload {
  sub: string;       // Nombre de usuario
  usuarioId: number; // ID del usuario
  empresaId: number; // ID de la empresa (null para ADMIN)
  rol: 'ADMINISTRADOR' | 'BODEGUERO' | 'EMPLEADO';
  exp: number;       // Fecha de expiración
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<UserTokenPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  public get currentUserValue(): UserTokenPayload | null {
    return this.currentUserSubject.value;
  }

  login(credentials: { usuario: string; contrasena: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.decodeAndSetUser(response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    return !!user && roles.includes(user.rol);
  }

  private decodeAndSetUser(token: string): void {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return;

      let base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decodedPayload = JSON.parse(jsonPayload);
      this.currentUserSubject.next(decodedPayload as UserTokenPayload);
    } catch (e) {
      console.error('Error al decodificar token JWT:', e);
    }
  }
}