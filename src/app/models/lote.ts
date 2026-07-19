export interface LoteRequest {
  empresaId: number;
  productoId: number;
  numeroLote: string;
  fechaFabricacion?: string;
  fechaVencimiento?: string;
  cantidadActual: number;
  costoCompra: number;
  estado?: string;
}

export interface LoteResponse {
  id: number;
  empresaId: number;
  productoId: number;
  nombreProducto: string;
  numeroLote: string;
  fechaFabricacion?: string;
  fechaVencimiento?: string;
  cantidadActual: number;
  costoCompra: number;
  estado: string;
  createdAt: string;
  updatedAt: string;
}
