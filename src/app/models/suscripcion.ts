export interface SuscripcionResponse {
  id: number;
  empresaId: number;
  razonSocialEmpresa: string;
  fechaInicio: string;
  fechaFin: string;
  montoPagado: number;
  estadoPago: string;
  metodoPago: string;
}
