import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ValidacionResultado {
  existe: boolean;
  mensaje: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ValidacionService {
  private apiUrl = 'http://localhost:8080/api/validaciones';

  constructor(private http: HttpClient) { }

  validarRuc(valor: string): Observable<ValidacionResultado> {
    return this.http.get<ValidacionResultado>(`${this.apiUrl}/empresa/ruc`, { params: { valor } });
  }

  validarCorreoEmpresa(valor: string): Observable<ValidacionResultado> {
    return this.http.get<ValidacionResultado>(`${this.apiUrl}/empresa/correo`, { params: { valor } });
  }

  validarTelefonoEmpresa(valor: string): Observable<ValidacionResultado> {
    return this.http.get<ValidacionResultado>(`${this.apiUrl}/empresa/telefono`, { params: { valor } });
  }

  validarDireccionEmpresa(valor: string): Observable<ValidacionResultado> {
    return this.http.get<ValidacionResultado>(`${this.apiUrl}/empresa/direccion`, { params: { valor } });
  }

  validarUsuarioBodeguero(valor: string): Observable<ValidacionResultado> {
    return this.http.get<ValidacionResultado>(`${this.apiUrl}/usuario/nombre`, { params: { valor } });
  }

  validarCorreoBodeguero(valor: string): Observable<ValidacionResultado> {
    return this.http.get<ValidacionResultado>(`${this.apiUrl}/usuario/correo`, { params: { valor } });
  }

  validarDniBodeguero(valor: string): Observable<ValidacionResultado> {
    return this.http.get<ValidacionResultado>(`${this.apiUrl}/usuario/dni`, { params: { valor } });
  }
}
