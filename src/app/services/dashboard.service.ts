import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardBodegueroResponse } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  obtenerDashboardBodeguero(): Observable<DashboardBodegueroResponse> {
    return this.http.get<DashboardBodegueroResponse>(`${this.apiUrl}/bodeguero`);
  }
}
