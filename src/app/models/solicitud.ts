export interface SolicitudRequest {
  empresaId: number;
  usuarioId: number;
  tipo: string; // e.g. "PRODUCTO" | "CATEGORIA"
  referenciaId: number;
  estado?: string; // PENDIENTE | APROBADO | RECHAZADO
  observacion?: string;
  nombrePropuesto?: string;
  precioPropuesto?: number;
  aprobadoPor?: number;
  fechaSolicitud?: string;
  fechaRespuesta?: string;
}

export interface SolicitudResponse {
  id: number;
  empresaId: number;
  usuarioId: number;
  nombreUsuario: string;
  tipo: string;
  referenciaId: number;
  estado: string; // PENDIENTE | APROBADO | RECHAZADO
  observacion?: string;
  nombrePropuesto?: string;
  precioPropuesto?: number;
  aprobadoPorId?: number;
  nombreAprobador?: string;
  fechaSolicitud: string;
  fechaRespuesta?: string;
  createdAt: string;
  updatedAt: string;
}