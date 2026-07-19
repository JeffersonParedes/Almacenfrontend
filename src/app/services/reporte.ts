import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteResponse } from '../models/reporte';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) { }

  generarInventario(paramsObj: any): Observable<ReporteResponse> {
    const params = this.buildParams(paramsObj);
    return this.http.get<ReporteResponse>(`${this.apiUrl}/inventario`, { params });
  }

  generarMovimiento(paramsObj: any): Observable<ReporteResponse> {
    const params = this.buildParams(paramsObj);
    return this.http.get<ReporteResponse>(`${this.apiUrl}/movimientos`, { params });
  }

  generarProducto(paramsObj: any): Observable<ReporteResponse> {
    const params = this.buildParams(paramsObj);
    return this.http.get<ReporteResponse>(`${this.apiUrl}/productos`, { params });
  }

  generarSuscripcion(paramsObj: any): Observable<ReporteResponse> {
    const params = this.buildParams(paramsObj);
    return this.http.get<ReporteResponse>(`${this.apiUrl}/suscripciones`, { params });
  }

  generarDashboard(): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/dashboard`);
  }

  descargarPdf(base64: string, filename: string): void {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  private buildParams(paramsObj: any): HttpParams {
    let params = new HttpParams();
    if (paramsObj) {
      Object.keys(paramsObj).forEach(key => {
        if (paramsObj[key] !== undefined && paramsObj[key] !== null && paramsObj[key] !== '') {
          params = params.set(key, paramsObj[key].toString());
        }
      });
    }
    return params;
  }
}
