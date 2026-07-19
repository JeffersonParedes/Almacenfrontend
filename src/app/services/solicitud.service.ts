import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudRequest, SolicitudResponse } from '../models/solicitud';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = 'http://localhost:8080/api/solicitudes';

  constructor(private http: HttpClient) { }

  crearSolicitud(solicitud: SolicitudRequest): Observable<SolicitudResponse> {
    return this.http.post<SolicitudResponse>(this.apiUrl, solicitud);
  }

  obtenerPorId(id: number): Observable<SolicitudResponse> {
    return this.http.get<SolicitudResponse>(`${this.apiUrl}/${id}`);
  }

  listarPorEmpresa(): Observable<SolicitudResponse[]> {
    return this.http.get<SolicitudResponse[]>(this.apiUrl);
  }

  procesarSolicitud(id: number, estado: 'APROBADO' | 'RECHAZADO', motivoRechazo?: string): Observable<void> {
    let url = `${this.apiUrl}/${id}/procesar?estado=${estado}`;
    if (motivoRechazo) {
      url += `&motivoRechazo=${encodeURIComponent(motivoRechazo)}`;
    }
    return this.http.patch<void>(url, null);
  }
}
