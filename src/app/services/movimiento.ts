import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovimientoRequest, MovimientoResponse, InventarioResponse } from '../models/movimiento';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private apiUrl = 'http://localhost:8080/api/movimientos';

  constructor(private http: HttpClient) { }

  listarKardex(): Observable<MovimientoResponse[]> {
    return this.http.get<MovimientoResponse[]>(`${this.apiUrl}/kardex`);
  }

  listarInventario(): Observable<InventarioResponse[]> {
    return this.http.get<InventarioResponse[]>(`${this.apiUrl}/inventario`);
  }

  registrarMovimiento(request: MovimientoRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(this.apiUrl, request);
  }

  registrarEntrada(request: MovimientoRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(`${this.apiUrl}/entrada`, request);
  }

  registrarSalida(request: MovimientoRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(`${this.apiUrl}/salida`, request);
  }

  registrarTraslado(request: MovimientoRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(`${this.apiUrl}/traslado`, request);
  }

  registrarAjuste(request: MovimientoRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(`${this.apiUrl}/ajuste`, request);
  }
}
