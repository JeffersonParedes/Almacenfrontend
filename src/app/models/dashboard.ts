export interface DashboardAdminResponse {
  empresasActivas: number;
  empresasSuspendidas: number;
  suscripcionesPorVencer: number;
  nuevasEmpresasMes: number;
}

export interface DashboardBodegueroResponse {
  inventarioTotal: number;
  productos: number;
  stockMinimo: number;
  productosVencer: number;
  solicitudes: number;
}
