import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificacionResponse } from '../models/notificacion';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:8080/api/notificaciones';

  constructor(private http: HttpClient) { }

  consultarPorUsuario(): Observable<NotificacionResponse[]> {
    return this.http.get<NotificacionResponse[]>(`${this.apiUrl}/usuario`);
  }

  consultarPorAdministrador(): Observable<NotificacionResponse[]> {
    return this.http.get<NotificacionResponse[]>(`${this.apiUrl}/admin`);
  }

  marcarComoLeida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/leer`, null);
  }
}
