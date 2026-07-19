export interface ReporteResponse {
  nombreArchivo: string;
  tipoArchivo: string;
  fechaGeneracion: string;
  tamañoArchivo: number;
  archivo: string; // Base64 string representing PDF bytes
}

export interface ReporteInventarioRequest {
  empresaId?: number;
  almacenId?: number;
}

export interface ReporteMovimientoRequest {
  empresaId?: number;
  almacenId?: number;
  tipoMovimiento?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteProductoRequest {
  empresaId?: number;
  categoriaId?: number;
  estadoAprobacion?: string;
}
