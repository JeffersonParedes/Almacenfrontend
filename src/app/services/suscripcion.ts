import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuscripcionResponse } from '../models/suscripcion';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private apiUrl = 'http://localhost:8080/api/suscripciones';

  constructor(private http: HttpClient) { }

  registrarSuscripcion(suscripcion: {
    empresaId: number;
    fechaInicio: string;
    fechaFin: string;
    montoPagado: number;
    metodoPago: string;
  }): Observable<SuscripcionResponse> {
    return this.http.post<SuscripcionResponse>(this.apiUrl, suscripcion);
  }

  renovarSuscripcion(empresaId: number, suscripcion: {
    fechaInicio: string;
    fechaFin: string;
    montoPagado: number;
    metodoPago: string;
  }): Observable<SuscripcionResponse> {
    return this.http.post<SuscripcionResponse>(`${this.apiUrl}/renovar/${empresaId}`, suscripcion);
  }

  consultarSuscripcionesPorVencer(dias: number): Observable<SuscripcionResponse[]> {
    return this.http.get<SuscripcionResponse[]>(`${this.apiUrl}/por-vencer?dias=${dias}`);
  }

  consultarHistorial(empresaId: number): Observable<SuscripcionResponse[]> {
    return this.http.get<SuscripcionResponse[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  actualizarEstadoSuscripciones(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/actualizar-estados`, null);
  }
}
