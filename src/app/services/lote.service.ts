import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoteRequest, LoteResponse } from '../models/lote';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private apiUrl = 'http://localhost:8080/api/lotes';

  constructor(private http: HttpClient) { }

  crearLote(lote: LoteRequest): Observable<LoteResponse> {
    return this.http.post<LoteResponse>(this.apiUrl, lote);
  }

  obtenerLotePorId(id: number): Observable<LoteResponse> {
    return this.http.get<LoteResponse>(`${this.apiUrl}/${id}`);
  }

  listarLotesPorProducto(productoId: number): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(`${this.apiUrl}/producto/${productoId}`);
  }

  consultarLotesPorVencer(dias: number = 30): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(`${this.apiUrl}/por-vencer?dias=${dias}`);
  }
}
