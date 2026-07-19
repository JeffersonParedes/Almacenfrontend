import { Producto } from './producto';
import { Almacen } from './almacen';

export interface MovimientoRequest {
  productoId: number;
  almacenId: number;
  tipoMovimiento: string; // ENTRADA | SALIDA | TRASLADO | DEVOLUCION | AJUSTE
  cantidad: number;
  motivo?: string;
  loteId?: number;
  destinoAlmacenId?: number;
}

export interface MovimientoResponse {
  id: number;
  tipoMovimiento: string;
  cantidad: number;
  fechaMovimiento: string;
  motivo?: string;
  producto: Producto;
  almacen: Almacen;
  nombreUsuario: string;
  lote?: any; // LoteResponse
  destinoAlmacen?: Almacen;
}

export interface InventarioResponse {
  id: number;
  stockActual: number;
  stockMinimo: number;
  ultimaActualizacion: string;
  producto: Producto;
  almacen: Almacen;
}
