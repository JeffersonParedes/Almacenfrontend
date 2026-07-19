import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa';
import { SuscripcionResponse } from '../models/suscripcion';
import { DashboardAdminResponse } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  registrarEmpresaSaaS(registro: {
    empresa: Empresa;
    usuarioBodeguero: string;
    correoBodeguero: string;
    contrasenaBodeguero: string;
    dniBodeguero: string;
    nombreBodeguero: string;
    planSuscripcion: string;
    montoPago: number;
    duracionMeses: number;
  }): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.apiUrl}/empresas`, registro);
  }

  suspenderEmpresa(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/empresas/${id}/suspender`, null);
  }

  reactivarEmpresa(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/empresas/${id}/reactivar`, null);
  }

  consultarEstadisticasSaaS(): Observable<DashboardAdminResponse> {
    return this.http.get<DashboardAdminResponse>(`${this.apiUrl}/stats`);
  }

  consultarSuscripciones(): Observable<SuscripcionResponse[]> {
    return this.http.get<SuscripcionResponse[]>(`${this.apiUrl}/suscripciones`);
  }

  enviarNotificacionGlobal(notificacion: {
    empresaId?: number | null;
    usuarioId?: number | null;
    tipo: string;
    titulo: string;
    mensaje: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/notificaciones`, notificacion);
  }
}
