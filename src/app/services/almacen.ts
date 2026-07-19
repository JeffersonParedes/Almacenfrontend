import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Almacen } from '../models/almacen';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private apiUrl = 'http://localhost:8080/api/almacenes';

  constructor(private http: HttpClient) { }

  getAlmacenes(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(this.apiUrl);
  }

  crearAlmacen(almacen: Almacen): Observable<Almacen> {
    return this.http.post<Almacen>(this.apiUrl, almacen);
  }

  eliminarAlmacen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  actualizarAlmacen(id: number, almacen: Almacen): Observable<Almacen> {
    return this.http.put<Almacen>(`${this.apiUrl}/${id}`, almacen);
  }

  activarAlmacen(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activar`, null);
  }

  desactivarAlmacen(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desactivar`, null);
  }
}