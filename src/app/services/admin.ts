import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private urlEmpresas = 'http://localhost:8080/api/empresas';
  private urlUsuarios = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

  // --- GESTIÓN DE EMPRESAS ---

  obtenerEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.urlEmpresas);
  }

  crearEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.urlEmpresas, empresa);
  }

  cambiarEstadoEmpresa(empresaId: number, activa: boolean): Observable<void> {
    const nuevoEstado = activa ? 'ACTIVO' : 'INACTIVO';
    return this.http.patch<void>(`${this.urlEmpresas}/${empresaId}/estado?nuevoEstado=${nuevoEstado}`, null);
  }

  // --- GESTIÓN DE USUARIOS ---

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.urlUsuarios, usuario);
  }

  desactivarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlUsuarios}/${id}`);
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.urlUsuarios);
  }
}