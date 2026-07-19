export interface Empresa {
  id?: number;
  ruc: string;
  razonSocial: string;
  direccionPrincipal?: string;
  telefonoContacto?: string;
  correoContacto?: string;
  fechaSuscripcion?: string;
  estado?: 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO';
}