import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteResponse, ReporteInventarioRequest, ReporteMovimientoRequest, ReporteProductoRequest } from '../models/reporte';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) { }

  generarInventario(req: ReporteInventarioRequest): Observable<ReporteResponse> {
    let params = new HttpParams();
    if (req.almacenId) {
      params = params.set('almacenId', req.almacenId.toString());
    }
    return this.http.get<ReporteResponse>(`${this.apiUrl}/inventario`, { params });
  }

  generarMovimientos(req: ReporteMovimientoRequest): Observable<ReporteResponse> {
    let params = new HttpParams();
    if (req.almacenId) params = params.set('almacenId', req.almacenId.toString());
    if (req.tipoMovimiento) params = params.set('tipoMovimiento', req.tipoMovimiento);
    if (req.fechaInicio) params = params.set('fechaInicio', req.fechaInicio);
    if (req.fechaFin) params = params.set('fechaFin', req.fechaFin);
    return this.http.get<ReporteResponse>(`${this.apiUrl}/movimientos`, { params });
  }

  generarProductos(req: ReporteProductoRequest): Observable<ReporteResponse> {
    let params = new HttpParams();
    if (req.categoriaId) params = params.set('categoriaId', req.categoriaId.toString());
    if (req.estadoAprobacion) params = params.set('estadoAprobacion', req.estadoAprobacion);
    return this.http.get<ReporteResponse>(`${this.apiUrl}/productos`, { params });
  }

  generarDashboard(): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/dashboard`);
  }

  // Descargar el archivo PDF decodificando el base64
  descargarPdf(reporte: ReporteResponse): void {
    const byteCharacters = atob(reporte.archivo);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = reporte.nombreArchivo || 'reporte.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
