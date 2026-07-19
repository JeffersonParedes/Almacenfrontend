import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventarioResponse } from '../models/movimiento';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:8080/api/inventario';

  constructor(private http: HttpClient) { }

  listarPorEmpresa(): Observable<InventarioResponse[]> {
    return this.http.get<InventarioResponse[]>(this.apiUrl);
  }

  listarPorAlmacen(almacenId: number): Observable<InventarioResponse[]> {
    return this.http.get<InventarioResponse[]>(`${this.apiUrl}/almacen/${almacenId}`);
  }

  obtenerPorProductoYAlmacen(productoId: number, almacenId: number): Observable<InventarioResponse> {
    return this.http.get<InventarioResponse>(`${this.apiUrl}/producto/${productoId}/almacen/${almacenId}`);
  }
}
