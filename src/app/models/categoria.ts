export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  estadoAprobacion?: string; // PENDIENTE | APROBADO | RECHAZADO
  estado?: string;
}
