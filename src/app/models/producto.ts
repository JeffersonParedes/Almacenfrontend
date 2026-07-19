import { Categoria } from './categoria';

export interface Producto {
  id?: number;
  categoriaId?: number; // Para el Request DTO
  codigoBarras?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
  estadoAprobacion?: string; // PENDIENTE | APROBADO | RECHAZADO
  estado?: string;
  categoria?: Categoria; // Para el Response DTO
}