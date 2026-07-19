import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardAdminResponse, DashboardBodegueroResponse } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  obtenerDashboardAdmin(): Observable<DashboardAdminResponse> {
    return this.http.get<DashboardAdminResponse>(`${this.apiUrl}/admin`);
  }

  obtenerDashboardBodeguero(): Observable<DashboardBodegueroResponse> {
    return this.http.get<DashboardBodegueroResponse>(`${this.apiUrl}/bodeguero`);
  }
}
