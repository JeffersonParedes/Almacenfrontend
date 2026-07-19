export interface NotificacionResponse {
  id: number;
  empresaId?: number;
  usuarioId?: number;
  administradorId?: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
}
