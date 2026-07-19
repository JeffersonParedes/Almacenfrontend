import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

// Administrador
import { AdministradorLayoutComponent } from './pages/administrador/layout/layout';
import { AdministradorDashboardComponent } from './pages/administrador/dashboard/dashboard';
import { AdministradorEmpresasComponent } from './pages/administrador/empresas/empresas';
import { AdministradorSuscripcionesComponent } from './pages/administrador/suscripciones/suscripciones';
import { AdministradorNotificacionesComponent } from './pages/administrador/notificaciones/notificaciones';
import { AdministradorReportesComponent } from './pages/administrador/reportes/reportes';
import { AdministradorPerfilComponent } from './pages/administrador/perfil/perfil';

// Bodeguero (Fase 2)
import { LayoutComponent } from './pages/panel-bodeguero/layout/layout';
import { DashboardComponent } from './pages/panel-bodeguero/dashboard/dashboard';
import { AlmacenesComponent } from './pages/panel-bodeguero/almacenes/almacenes';
import { CategoriasComponent } from './pages/panel-bodeguero/categorias/categorias';
import { ProductosComponent } from './pages/panel-bodeguero/productos/productos';
import { LotesComponent } from './pages/panel-bodeguero/lotes/lotes';
import { InventarioComponent } from './pages/panel-bodeguero/inventario/inventario';
import { MovimientosComponent } from './pages/panel-bodeguero/movimientos/movimientos';
import { UsuariosComponent } from './pages/panel-bodeguero/usuarios/usuarios';
import { SolicitudesComponent } from './pages/panel-bodeguero/solicitudes/solicitudes';
import { ReportesComponent } from './pages/panel-bodeguero/reportes/reportes';
import { NotificacionesComponent } from './pages/panel-bodeguero/notificaciones/notificaciones';
import { PerfilComponent } from './pages/panel-bodeguero/perfil/perfil';

// Empleado (Fase 3)
import { EmpleadoLayoutComponent } from './pages/panel-empleado/layout/layout';
import { EmpleadoProductosComponent } from './pages/panel-empleado/productos/productos';
import { EmpleadoCategoriasComponent } from './pages/panel-empleado/categorias/categorias';
import { EmpleadoInventarioComponent } from './pages/panel-empleado/inventario/inventario';
import { EmpleadoMovimientosComponent } from './pages/panel-empleado/movimientos/movimientos';
import { EmpleadoSolicitudesComponent } from './pages/panel-empleado/solicitudes/solicitudes';
import { EmpleadoNotificacionesComponent } from './pages/panel-empleado/notificaciones/notificaciones';
import { EmpleadoPerfilComponent } from './pages/panel-empleado/perfil/perfil';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Panel Administrador (SaaS Super-Admin)
  {
    path: 'administrador',
    component: AdministradorLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdministradorDashboardComponent },
      { path: 'empresas', component: AdministradorEmpresasComponent },
      { path: 'suscripciones', component: AdministradorSuscripcionesComponent },
      { path: 'notificaciones', component: AdministradorNotificacionesComponent },
      { path: 'reportes', component: AdministradorReportesComponent },
      { path: 'perfil', component: AdministradorPerfilComponent }
    ]
  },

  // Panel Bodeguero (Fase 2)
  {
    path: 'bodeguero',
    component: LayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BODEGUERO'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'almacenes', component: AlmacenesComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'lotes', component: LotesComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'movimientos', component: MovimientosComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'solicitudes', component: SolicitudesComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'notificaciones', component: NotificacionesComponent },
      { path: 'perfil', component: PerfilComponent }
    ]
  },

  // Panel Empleado (Fase 3)
  {
    path: 'empleado',
    component: EmpleadoLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLEADO'] },
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { path: 'productos', component: EmpleadoProductosComponent },
      { path: 'categorias', component: EmpleadoCategoriasComponent },
      { path: 'inventario', component: EmpleadoInventarioComponent },
      { path: 'movimientos', component: EmpleadoMovimientosComponent },
      { path: 'solicitudes', component: EmpleadoSolicitudesComponent },
      { path: 'notificaciones', component: EmpleadoNotificacionesComponent },
      { path: 'perfil', component: EmpleadoPerfilComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];