import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) { }

  listarActivos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  listarBorrados(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/papelera`);
  }

  sugerirProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  registrarProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/registrar`, producto);
  }

  actualizarProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  aprobarProducto(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/aprobar`, null);
  }

  rechazarProducto(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/rechazar`, null);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  consultarProductosConStockMinimo(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/stock-minimo`);
  }

  consultarProductosProximosAVencer(dias: number = 30): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/proximos-vencer?dias=${dias}`);
  }
}
